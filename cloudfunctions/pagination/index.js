// 分页请求云函数
// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

/* 云函数入口函数 
* @param  event.dbName  集合名称
* @param  event.filter  筛选条件，默认为空，格式 {_id: xxxx}   
* @param  event.pageIndex  当前第几页，默认为第一页
* @param  event.pageSize  每页取多少条记录，默认为10条
*/
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { dbName, filter = {}, pageIndex = 1, pageSize = 10 } = event;
  // 获取集合中的总记录数
  const countResult = await db.collection(dbName).where(filter).count();
  const { total } = countResult;
  const totalPage = Math.ceil(total / pageSize);
  const hasMore = pageIndex < totalPage;
  // 查询并返回
  return db.collection(dbName)
  .where(filter)
  .skip((pageIndex - 1) * pageSize)
  .limit(pageSize)
  .get()
  .then(res => {
    res.total = total;
    res.hasMore = hasMore;
    return res;
  })
}