/**
 * 登录流程
 * 	1.收集表单数据
 * 	2.前端验证
 * 		1)验证用户信息是否合法(账号，密码)
 * 	3.后端验证
 * 		1)验证用户是否存在
 * 		2)用户存在，再验证密码
 */
import request from '../../utils/request.js'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		phone: "",
		password: ""
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

	},
	//收集表单数据
	handleInput(e) {
		let type = e.currentTarget.id
		this.setData({
			[type]:e.detail.value
		})
		// console.log(type, e.detail.value)
	},
	//登录
	async login(){
		let {phone,password} = this.data
		//前端验证
		if(!phone){
			wx.showToast({
				title:"手机号不能为空",
				icon:'error'
			})
			return;
		}
		let phoneReg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
		if(!phoneReg.test(phone)){
			wx.showToast({
				title:"手机号不正确",
				icon:'error'
			})
			return;
		}
		if(!password){
			wx.showToast({
				title:"密码不能为空",
				icon:'error'
			})
			return;
		}
		//后端验证
		let result = await request('/login/cellphone',{phone,password,isLogin:true})
		if(result.code===200){
			wx.showToast({
				title:'登录成功'
			})
			//将用户信息存储至本地
			wx.setStorageSync("userInfo",JSON.stringify(result.profile))
			wx.reLaunch({
				url:"/pages/person/person"
			})
		}else if(result.code===400){
			wx.showToast({
				title:'手机号错误',
				icon:"error"
			})
		}else if(result.code===502){
			wx.showToast({
				title:'密码错误',
				icon:"error"
			})
		}else{
			wx.showToast({
				title:'登录失败',
				icon:"error"
			})
		}
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
