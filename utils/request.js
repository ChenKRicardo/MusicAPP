//发送ajax请求
// 封装功能函数
// 	1.功能点明确
// 	2.函数内部保留固定代码（静态的）
// 	3.将动态的数据抽取成形参，使用者根据实际动态的传入实参
// 	4.一个良好的功能函数应该设置形参的默认值（ES6形参默认值）
// 封装功能组件
// 	1.功能点明确
// 	2.组件内部保留静态代码
// 	3.将动态的数据抽取成props参数，使用者根据实际以标签属性的形式动态传入props数据
// 	4.一个良好的组件应该设置组件的必要性及数据类型
import config from './config.js'
export default (url,data={},method="GET")=>{
	return new Promise((reslove,reject)=>{
		wx.request({
			url:config.host+url,
			data,
			method,
			header:{
				cookie:wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item=>item.indexOf('MUSIC_U')!==-1):""
			},
			method:"get",
			success:(res)=>{
				if(data.isLogin){
					//存储cookies
					wx.setStorage({
						key:'cookies',
						data:res.cookies
					})
				}
				reslove(res.data)
			},
			fail:(err)=>{
				reject(err)
			}		
		})
	})
	
}