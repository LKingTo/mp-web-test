// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();
const dbName = 'webNotes';

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;
  let {
    _id,
    type,
    params,
  } = event;
  if (type === 'add') {
    // 获取集合中的总记录数
    const countResult = await db.collection(dbName).count();
    const {
      total
    } = countResult;
    try {
      return await db.collection(dbName).add({
        // data 字段表示需新增的 JSON 数据
        data: {
          _openid: openid,
          status: 'normal',
          orderId: total + 1,
          question: params.question || '',
          answer: params.answer || '',
          marked: false,
          rank: params.rank || 0,
          tags: params.tags || [],
          updateTS: new Date().getTime()
        }
      })
    } catch (e) {
      console.error(e)
    }
  } else {
    params.updateTS = new Date().getTime();
    try {
      return await db.collection(dbName)
        .where({
          _id,
        }).update({
          data: params,
        })
    } catch (e) {
      console.error(e);
    }
  }
}