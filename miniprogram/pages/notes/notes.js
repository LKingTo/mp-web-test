// miniprogram/pages/notes/notes.js
import globalMixin from "../../mixin/mixin_global.js";
const app = getApp();

Page({
  mixins: [globalMixin],
  myData: {
    pageIndex: 1,
    pageSize: 20,
  },
  /**
   * 页面的初始数据
   */
  data: {
    activeNames: null,
    list: [],
    isLoading: false,
    isNoResult: false,
    isNoMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // wx.hideTabBar();
    wx.hideTabBar({
      aniamtion: false,
      success: {},
      fail: {},
      complete: {}
    })
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
    console.log('Page notes onShow');
    this.listenUpdateItem();
    this.listenAddItem();
    this.listenDelItem();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  onUnload: function() {
    wx.removeStorageSync('KEY_CURRENT_WEB_NOTE');
    wx.removeStorageSync('KEY_ADD_WEB_NOTE');
    wx.removeStorageSync('KEY_DEL_WEB_NOTE');
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.log('on pull down');
    if (this.data.isLoading) {
      return wx.stopPullDownRefresh();
    }
    this.beginLoad();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log('on reach bottom');
    this.loadMoreItems();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  // 监听更新指定条目
  listenUpdateItem() {
    let currentItem = wx.getStorageSync('KEY_CURRENT_WEB_NOTE');
    if (currentItem) {
      wx.removeStorageSync('KEY_CURRENT_WEB_NOTE');
      currentItem._answer = this.htmlParser(currentItem.answer);
      const targetIndex = this.data.list.findIndex(item => {
        return item._id === currentItem._id;
      });
      const current = `list[${targetIndex}]`;
      this.setData({
        [current]: currentItem,
      })
    }
  },

  // 监听新增条目
  listenAddItem() {
    if (!this.data.isNoMore) return;
    let addItemId = wx.getStorageSync('KEY_ADD_WEB_NOTE');
    if (addItemId) {
      wx.removeStorageSync('KEY_ADD_WEB_NOTE');
      const db = wx.cloud.database();
      db.collection('webNotes').doc(addItemId).get().then(res => {
        const addItem = res.data;
        addItem._answer = this.htmlParser(addItem.answer);
        const add = `list[${this.data.list.length}]`;
        this.setData({
          [add]: addItem,
        })
      });
    }
  },

  // 监听删除条目
  listenDelItem() {
    if (wx.getStorageSync('KEY_DEL_WEB_NOTE')) {
      const id = wx.getStorageSync('KEY_DEL_WEB_NOTE');
      const targetIndex = this.data.list.findIndex(item => {
        return item._id === id;
      });
      this.data.list.splice(targetIndex, 1);
      this.setData({
        list: this.data.list
      });
      wx.removeStorageSync('KEY_DEL_WEB_NOTE');
    }
  },

  /* 加载列表 */
  beginLoad() {
    this.myData.pageIndex = 1;
    this.setData({
      list: [],
      isLoading: true,
      isNoResult: false,
      isNoMore: false
    });
    wx.stopPullDownRefresh();
    try {
      wx.cloud.callFunction({
        name: 'pagination',
        data: {
          dbName: 'webNotes',
          pageIndex: this.myData.pageIndex,
          pageSize: this.myData.pageSize
        }
      }).then(res => {
        console.log('call init', res);
        const { result } = res;
        const data = result && result.data;
        if (!data || !data.length) {
          this.setData({
            isLoading: false,
            isNoResult: true,
          });
          return;
        }
        // 解析富文本html2json
        data.forEach(item => {
          item._answer = this.htmlParser(item.answer);
          const add = `list[${this.data.list.length}]`;
          this.setData({
            [add]: item,
          });
        })
        this.setData({
          isLoading: false,
        });
      }, err => {
        this.setData({
          isLoading: false
        });
        console.log('[获取笔记列表失败]', err);
      });
    } catch {
      console.log('[调用云函数][pagination]失败');
    }
  },

  /* 获取更多 */
  loadMoreItems() {
    if (this.data.isNoMore) return;
    this.myData.pageIndex = this.myData.pageIndex + 1;
    this.setData({
      isLoading: true
    });
    try {
      wx.cloud.callFunction({
        name: 'pagination',
        data: {
          dbName: 'webNotes',
          pageIndex: this.myData.pageIndex,
          pageSize: this.myData.pageSize
        }
      }).then(res => {
        console.log('call more', res.result);
        const { result } = res;
        const data = result && result.data;
        if (!data || !data.length) {
          this.setData({
            isLoading: false,
            isNoMore: !result.hasMore,
          })
          return;
        }
        // 解析富文本html2json
        data.forEach(item => {
          item._answer = this.htmlParser(item.answer);
          const add = `list[${this.data.list.length}]`;
          this.setData({
            [add]: item,
          });
        })
        this.setData({
          isLoading: false,
          isNoMore: !result.hasMore,
        });
      }, err => {
        this.setData({
          isLoading: false
        });
        console.log('[获取笔记列表失败]', err);
      });
    } catch {
      console.log('[调用云函数][pagination]失败');      
    }
  },

  /* 展开某项 */
  onExpand(event) {
    console.log(event);
    this.setData({
      activeNames: event.detail
    });
  },

  /* 编辑某项 */
  doEdit(event) {
    const { id } = event.currentTarget.dataset;
    const currentItem = this.data.list.find(item => {
      return item._id === id;
    });
    wx.setStorageSync('KEY_CURRENT_WEB_NOTE', currentItem);
    // 跳转编辑页
    wx.navigateTo({
      url: '/pages/edit/edit?mode=edit',
    })
  },

  /* 删除某项 */
  doDelete(event) {
    const { id, index } = event.currentTarget.dataset;
    wx.showModal({
      title: '',
      content: '是否确认删除？',
      success: res => {
        if (res.confirm) {
          const db = wx.cloud.database();
          db.collection('webNotes').doc(id).remove().then(res => {
            wx.showToast({
              title: '删除成功！',
            });
            this.data.list.splice(index, 1);
            this.setData({
              list: this.data.list
            })
          });
        }
      }
    });
  },

  onTapSearch() {
    console.log('tap search');
    wx.navigateTo({
      url: '/pages/search/search',
    })
  }
})