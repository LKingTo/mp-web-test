// miniprogram/pages/detail/detail.js
import globalMixin from "../../mixin/mixin_global.js";
const app = getApp();

Page({
  mixins: [globalMixin],
  myData: {
    id: '',
    currentItem: null
  },
  /**
   * 页面的初始数据
   */
  data: {
    question: '',
    answer: '',
    locked: true,
    isError: false,
    ctrlBoxBottom: app.globalData.isIphoneX ? 34 : 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    const { id } = options;
    if (!id) {
      this.setData({
        isError: true,
      })
      return;
    }
    this.myData.id = id;
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
    console.log('Page detail onShow');
    this.listenUpdateItem();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  loadDetail() {
    const id = this.myData.id;
    wx.showLoading({
      title: '加载中',
    });
    const db = wx.cloud.database();
    db.collection('webNotes').doc(id).get().then(res => {
      wx.hideLoading();
      console.log('[current detail]：', res);
      let currentItem = res && res.data || {};
      this.myData.currentItem = currentItem;
      currentItem._answer = this.htmlParser(currentItem.answer);
      this.setData({
        question: currentItem.question,
        answer: currentItem._answer,
      })
    });
  },

  // 监听更新指定条目
  listenUpdateItem() {
    let currentItem = wx.getStorageSync('KEY_CURRENT_WEB_NOTE');
    if (currentItem) {
      // wx.removeStorageSync('KEY_CURRENT_WEB_NOTE');
      this.myData.currentItem = currentItem;
      currentItem._answer = this.htmlParser(currentItem.answer);
      this.setData({
        question: currentItem.question,
        answer: currentItem._answer,
      })
    } else {
      this.loadDetail();
    }
  },

  onClicklock() {
    this.setData({
      locked: !this.data.locked,
    })
  },

  /* 编辑某项 */
  doEdit(event) {
    wx.setStorageSync('KEY_CURRENT_WEB_NOTE', this.myData.currentItem);
    // 跳转编辑页
    wx.navigateTo({
      url: '/pages/edit/edit?mode=edit&delta=1',
    })
  },

  /* 删除某项 */
  doDelete(event) {
    const { id } = this.myData;
    wx.showModal({
      title: '',
      content: '是否确认删除？',
      success: res => {
        if (res.confirm) {
          const db = wx.cloud.database();
          db.collection('webNotes').doc(id).remove().then(res => {
            wx.showToast({
              title: '删除成功！',
              success() {
                wx.setStorageSync('KEY_DEL_WEB_NOTE', id);
                // 关闭当前页
                wx.navigateBack({
                  delta: 1
                });
              }
            });
          });
        }
      }
    });
  },
})