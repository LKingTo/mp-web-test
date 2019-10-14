//app.js
// 引用mixin
require('/mixin/mixin.js');

App({
  onLaunch: function () {
    console.log('App onLaunch');
    wx.hideTabBar();
    wx.removeStorageSync('KEY_CURRENT_WEB_NOTE');
    wx.removeStorageSync('KEY_ADD_WEB_NOTE');
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
    
    wx.getSystemInfo({
      success: res => {
        console.log('[systemInfo]:', res);
        //model中包含着设备信息
        const { model } = res;
        this.globalData.systemInfo = res;
        this.globalData.isIphoneX = model.search('iPhone X') != -1;
        if (this.sysmtemInfoReadyCallback) {
          this.systemInfoReadyCallback(res);
        }
      }
    });
  },

  editTabbar: function () {
    let tabbar = this.globalData.tabBar;
    let currentPages = getCurrentPages();
    let _this = currentPages[currentPages.length - 1];
    let pagePath = _this.route;
    (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);
    for (let i in tabbar.list) {
      tabbar.list[i].selected = false;
      (tabbar.list[i].pagePath == pagePath) && (tabbar.list[i].selected = true);
    }
    _this.setData({
      tabbar: tabbar
    });
  },

  globalData: {
    userInfo: null,
    systemInfo: null,
    isIphoneX: false,
    tabBar: {
      "backgroundColor": "#ffffff",
      "color": "#888888",
      "selectedColor": "#458255",
      "list": [
        {
          "pagePath": "/pages/notes/notes",
          "iconPath": "/images/icons/notes-fill.png",
          "selectedIconPath": "/images/icons/notes-fill-actived.png",
          "text": "列表"
        },
        {
          "pagePath": "/pages/edit/edit",
          "iconPath": "/images/icons/add-actived.png",
          "selectedIconPath": "/images/icons/add-actived.png",
          "isSpecial": true,
          "text": "发布"
        },
        {
          "pagePath": "/pages/exercise/exercise",
          "iconPath": "/images/icons/exercise-fill.png",
          "selectedIconPath": "/images/icons/exercise-fill-actived.png",
          "text": "练习"
        }
      ]
    }
  }
})
