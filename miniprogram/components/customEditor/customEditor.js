// components/customEditor/customEditor.js
const util = require('../../util/util.js')
const compareVersion = util.compareVersion;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    content: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    formats: {},
    readOnly: false,
    placeholder: '请输入内容...',
  },

  lifetimes: {
    ready: function () {
      this.canUse = true
      // wx.loadFontFace({
      //   family: 'Pacifico',
      //   source: 'url("https://sungd.github.io/Pacifico.ttf")',
      //   success: console.log
      // })
      const { SDKVersion } = wx.getSystemInfoSync()

      if (compareVersion(SDKVersion, '2.7.0') >= 0) {
        //
      } else {
        this.canUse = false
        // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /* 编辑器初始化 */
    onEditorReady() {
      this.createSelectorQuery().select('#editor').context(res => {
        this.editorCtx = res.context;
        // if (wx.getStorageSync('editor-content')) { // 设置~历史值
        //   this.editorCtx.insertText(wx.getStorageSync("editor-content")) // 注意：插入的是对象
        // }
        this.editorCtx.setContents({
          // delta: this.data.content,
          html: this.data.content,
          success(res) {
            console.log('初始化设置文本内容完成', res);
          },
          fail(err) {
            console.log('setContents error', err);
          }
        })
      }).exec()
    },

    undo() {
      this.editorCtx.undo();
    },

    redo() {
      this.editorCtx.redo();
    },

    format(e) {
      if (!this.canUse) return;
      const { name, value } = e.target.dataset;
      if (!name) return;
      this.editorCtx.format(name, value);
    },

    // 返回选区已设置的样式
    onStatusChange(e) {
      const formats = e.detail;
      this.setData({ formats });
    },

    insertDivider() {
      this.editorCtx.insertDivider({
        success() {
          console.log('insert divider success')
        }
      })
    },

    clear() {
      this.editorCtx.clear({
        success() {
          console.log('clear success')
        }
      })
    },

    removeFormat() {
      this.editorCtx.removeFormat();
    },

    // 插入日期
    insertDate() {
      const date = new Date();
      const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      this.editorCtx.insertText({
        text: formatDate
      })
    },

    // 插入图片
    insertImage() {
      wx.chooseImage({
        count: 1,
        success: res => {
          this.editorCtx.insertImage({
            src: res.tempFilePaths[0],
            data: {
              id: new Date().getTime(),
              role: 'master',
              width: '100%',
            },
            success() {
              console.log('insert image success')
            }
          })
        }
      })
    }
  }
})
