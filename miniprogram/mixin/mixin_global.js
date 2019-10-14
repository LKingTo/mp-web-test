/**
 * Page通用mixin混合对象
 */

import parser from '../richTextParser/parser.js';
const app = getApp();

module.exports = {
  properties: {},
  data: {
    pageWidth: app.globalData.systemInfo.windowWidth,
    pageHeight: app.globalData.systemInfo.windowHeight,
    isIphoneX: app.globalData.isIphoneX,
  },

  // 富文本解析：html2json，
  // 依赖rich-text-parser插件，github: https://github.com/Chaunjie/rich-text-parser 
  htmlParser(html) {
    // 格式化节点样式
    const formatStyle = (children) => {
      children.forEach(child => {
        if (child.name === 'img') { // 图片限制宽度
          child.attrs.style += `;max-width:${this.data.pageWidth - 40}px;`;
        }
        if (child.name) { // 文本自动换行
          child.attrs.style += `;word-break: break-all;`;
        }
        if (child.children && child.children.length) {
          formatStyle(child.children);
        }
      })
    };
    // 定义需要解析的特殊标签，value不填默认是div
    parser.definedCustomTag({
      figure: 'div',
      figcaption: ''
    });
    const { children } = parser.getRichTextJson((html));
    formatStyle(children);
    // console.log('node children', children);
    return children;
  },
}