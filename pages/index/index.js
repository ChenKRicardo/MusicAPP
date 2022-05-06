// pages/index/index.js
import request from "../../utils/request.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
	bannerList:[],//轮播图数据
	recommendList:[],//推荐数据
	topList:[],//榜单数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
	  //获取轮播图
   let bannerListData = await request("/banner",{type:2})
	this.setData({
		bannerList:bannerListData.banners
	})
	let recommendListData = await request("/personalized",{limit:5})
	this.setData({
		recommendList:recommendListData.result
	})
	//排行榜
	let index = 0 
	let resultArr = []
	while(index<5){
	let topListData = await request("/top/list",{idx:index++})
	let topListItem = {name:topListData.playlist.name,tracks:topListData.playlist.tracks.splice(0,3)}
	resultArr.push(topListItem)
	//不需要等待5次请求全部结束，但渲染次数多
	this.setData({
		topList:resultArr
	})
	}
	//放在此处会导致页面长时间白屏
	// this.setData({
	// 	topList:resultArr
	// })
  },
  toRecommend(){
    wx.navigateTo({
      url:"/songPackage/pages/recommend/recommedn"
    })
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})