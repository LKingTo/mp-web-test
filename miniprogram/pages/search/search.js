// miniprogram/pages/search/search.js
import globalMixin from "../../mixin/mixin_global.js";
import { debounce } from "../../util/util.js";
const app = getApp();

Page({
  mixins: [globalMixin],
  myData: {
    value: '',
  },
  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    list: [],
    isNoResult: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.inputDebounce = debounce(() => {
        this.querySearch();
      }, 200);
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
    this.listenDelItem();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  listenDelItem() {
    if (wx.getStorageSync('KEY_DEL_WEB_NOTE')) {
      const id = wx.getStorageSync('KEY_DEL_WEB_NOTE');
      const targetIndex = this.data.list.findIndex(item => {
        return item._id === id;
      });
      this.data.list.splice(targetIndex, 1);
      this.setData({
        isNoResult: !this.data.length,
        list: this.data.list
      });
    }
  },

  onSearch() {
    this.inputDebounce();
  },

  onCancel() {
    this.reset();
  },

  onClear() {
    this.reset();
  },

  onChange(event) {
    this.setData({
      searchValue: event.detail,
    }) 
    this.inputDebounce();
  },

  querySearch() {
    if (!this.data.searchValue) {
      this.reset();
      return;
    }
    const db = wx.cloud.database(); //初始化数据库
    db.collection("webNotes").where({
      //这个查询就是查询all表中 字段为name中 like你传的值的所有数据
      //后面的$options:'1' 代表这个like的条件不区分大小写
      question: {
        $regex: '.*' + this.data.searchValue,
        // $options: 'i'
      }
    }).get().then(res => {
      const { data } = res;
      let list = [];
      // 解析富文本html2json
      if (data.length) {
        const highlightWord = this.data.searchValue;
        data.forEach(item => {
          // 匹配字高亮处理
          item.question = item.question.replace(highlightWord, `<span style="color: #20a162">${highlightWord}</span>`);
          item.question = this.htmlParser(item.question);
          list.push({
            question: item.question,
            _id: item._id
          });
        })
      }
      this.setData({
        isNoResult: !list.length,
        list,
      });
    });
  },

  reset() {
    this.setData({
      list: [],
    })
  }
})