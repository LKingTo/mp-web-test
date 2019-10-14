// miniprogram/pages/exercise/exercise.js
import globalMixin from "../../mixin/mixin_global.js";
const app = getApp();

Page({
  mixins: [globalMixin],
  myData: {
    currentItem: {},
    randomList: [],
  },
  /**
   * 页面的初始数据
   */
  data: {
    mode: 'random', // 出题模式，默认随机模式
    randomChecked: true,
    currentIndex: 0,
    question: '',
    answer: '',
    inputContent: '',
    totalItems: 0,
    locked: true,
    ctrlBoxBottom: app.globalData.isIphoneX ? 74 : 40
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideTabBar();
    app.editTabbar(); // 初始化tabbar
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.beginLoad();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  /* 获取索引 */
  getQueryIndex() {
    if (this.data.mode === 'order') { // 顺序模式，顺序索引
      return this.data.currentIndex;
    }
    // 随机模式，返回随机数
    const getRandom = () => {
      const total = this.data.totalItems;
      let num = Math.floor(Math.random() * total);
      if (this.myData.randomList.length < total) {
        while (this.myData.randomList.includes(num)) {
          console.log(`随机数${num}已存在`);
          num = Math.floor(Math.random() * total);
        }
        this.myData.randomList.push(num);
      }
      console.log(`随机数${num}`);
      return num;
    };
    return getRandom();
  },

  /* 开始加载 */
  async beginLoad() {
    this.myData.randomList = [];
    this.setData({
      currentIndex: 0,
    })
    wx.showLoading({
      title: '加载中',
    });
    const db = wx.cloud.database();
    // 先获取笔记总数
    const { total } = await db.collection('webNotes').count();
    this.setData({
      totalItems: total,
    });
    // 获取查询索引
    const queryIndex = this.getQueryIndex();
    this.loadCurrentItem(queryIndex);
  },

  /* 查询当前项目详情 */
  loadCurrentItem(queryIndex) {
    this.setData({
      currentIndex: queryIndex
    });
    wx.showLoading({
      title: '加载中',
    });
    const db = wx.cloud.database();
    db.collection('webNotes').skip(queryIndex).limit(1).get().then(res => {
      wx.hideLoading();
      console.log('[当前题目]：', res);
      let currentItem = res && res.data && res.data[0] || {};
      currentItem._answer = this.htmlParser(currentItem.answer);
      this.setData({
        question: currentItem.question,
        answer: currentItem._answer,
      })
    });
  },

  /* 解锁 */
  onClicklock() {
    this.setData({
      locked: !this.data.locked,
    })
  },

  /* 切换模式 */
  onModeChange({ detail }) {
    const randomChecked = detail === 'random';
    wx.showModal({
      content: `是否${randomChecked ? '关闭' : '开启'}随机模式？`,
      success: res => {
        if (res.confirm) {
          this.setData({
            mode: this.data.mode === 'random' ? 'order' : 'random',
            randomChecked: !this.data.randomChecked,
          });
          // 重新加载数据
          this.reset();
          this.beginLoad();
        }
      }
    });
  },

  /* 上一题 */
  onClickPrev() {
    if (this.data.mode === 'order') {
      const total = this.data.totalItems;
      const currentIndex = this.data.currentIndex;
      if (currentIndex == 0) return;
      const nextIndex = currentIndex === 0 ?
        0 :
        currentIndex - 1;
      this.setData({
        currentIndex: nextIndex,
      })
    }
    this.reset();
    this.loadCurrentItem(this.getQueryIndex());
  },

  /* 下一题 */
  onClickNext() {
    if (this.data.mode === 'order') {
      const total = this.data.totalItems;
      const currentIndex = this.data.currentIndex;
      if (currentIndex == total - 1) return;
      const nextIndex = currentIndex === total - 1 ?
        total - 1 :
        currentIndex + 1;
      console.log('nextIndex', nextIndex);
      this.setData({
        currentIndex: nextIndex,
      })
    }
    this.reset();
    this.loadCurrentItem(this.getQueryIndex());
  },

  reset() {
    this.setData({
      locked: true,
      inputContent: '',
    });
  },

  onTextAreaBlur(event) {
    this.setData({
      inputContent: event.detail.value,
    })
  },
})