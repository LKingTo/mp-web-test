// miniprogram/pages/edit/edit.js
const { compareVersion } = require('../../util/util.js');
const app = getApp();
import Notify from '../../vant/notify/notify';
import Toast from '../../vant/toast/toast';

Page({
  myData: {
    isEdit: false,
    currentItem: null,
    delta: 0,   // wx.navigateBack() 返回的页面数
  },
  /**
   * 页面的初始数据
   */
  data: {
    submitText: '',
    title: '',
    content: '',
    pageWidth: app.globalData.systemInfo.windowWidth
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    const isEdit = options.mode === 'edit';
    this.myData.isEdit = isEdit;
    this.myData.delta = options.delta || 0;
    this.setData({
      submitText: isEdit ? '保存' : '发布',
    });
    // 修改模式，从缓存读取要修改的笔记
    if (isEdit && wx.getStorageSync('KEY_CURRENT_WEB_NOTE')) {
      this.myData.currentItem = wx.getStorageSync('KEY_CURRENT_WEB_NOTE');
      this.setData({
        title: this.myData.currentItem.question,
        content: this.myData.currentItem.answer,
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  bindKeyInput: function (e) {
    console.log(e);
    this.setData({
      title: e.detail
    })
  },

  // 获取富文本内容
  getEditorContent() {
    if (!this.editorComponent) {
      this.editorComponent = this.selectComponent('#custom-editor');
    }
    return new Promise((resolve, reject) => {
      this.editorComponent.editorCtx.getContents({
        success: res => {
          resolve(res.html);
        },
        fail: err => {
          console.log('getContents fail:', err);
          resolve('');
        }
      })
    })
  },

  // 校验表单(不校验富文本)
  doValid() {
    if (!this.data.title) {
      return '题目不能为空！';
    }
    return null;
  },

  async save() {
    const result = this.doValid();
    if (result) {
      return Notify({
        message: result,
        background: '#d41027',
        duration: 1000,
        selector: '#van-notify'
      });
    }
    this.editorContent = await this.getEditorContent();
    // 提交到数据库
    this.doSubmit();
  },

  doSubmit() {
    const type = this.myData.isEdit ? 'edit' : 'add';
    const params = {
      "question": this.data.title,
      "answer": this.editorContent,
    };
    const currentItem = this.myData.currentItem;
    wx.showLoading({
      title: '加载中',
    });
    try {
      wx.cloud.callFunction({
        name: 'updateNote',
        data: {
          _id: currentItem && currentItem._id || null,
          type,
          params,
        }
      }).then(res => {
        wx.hideLoading();
        console.log('[保存成功]', res);
        Toast({
          type: 'success',
          message: `${this.data.submitText}成功！`,
          selector: '#van-toast',
          duration: 2000,
          onClose: () => {
            if (this.myData.isEdit) {
              this.myData.currentItem = Object.assign(this.myData.currentItem, params);
              wx.setStorageSync('KEY_CURRENT_WEB_NOTE', this.myData.currentItem);
            } else {
              wx.setStorageSync('KEY_ADD_WEB_NOTE', res.result._id);
            }
            if (this.myData.delta) {
              wx.navigateBack({
                delta: this.myData.delta
              })
            } else {
              wx.switchTab({
                url: '/pages/notes/notes',
              })
            }
          }
        });
      }, err => {
        wx.hideLoading();
        console.log('[添加笔记失败]', err);
        Toast({
          type: 'fail',
          message: `${this.data.submitText}失败！`,
          selector: '#van-toast',
          duration: 2000,
        });
      });
    } catch {
      wx.hideLoading();
      console.log('[调用云函数][updateNote]失败');
      Toast({
        type: 'fail',
        message: `${this.data.submitText}失败！`,
        selector: '#van-toast',
        duration: 2000,
      });
    }
  }
})