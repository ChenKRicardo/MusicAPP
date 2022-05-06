// pages/video/video.js
import request from "../../utils/request.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navList: [],
    navId: "", //导航标识
    videoList: [], //视频数据
    videoId: "", //视频id标识
    videoUpdateTime: [], //记录视频播放的时长
    isTriggered: "", //设置下拉刷新状态
    offset: 1, //上拉刷新视频页数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getNavList();
  },
  //获取导航数据
  async getNavList() {
    let navListData = await request("/video/group/list");
    this.setData({
      navList: navListData.data.slice(0, 14),
      navId: navListData.data[0].id,
    });
    this.getGroupList(this.data.navId);
  },
  //切换导航
  changeNav(event) {
    let navId = event.currentTarget.id;
    this.setData({
      navId,
      videoList: [],
    });
    //显示Loading
    wx.showLoading({
      title: "Loading",
    });
    this.getGroupList(this.data.navId);
  },
  //获取列表数据
  async getGroupList(navId, offset = 1) {
    let index = 0;
    let groupListData = await request("/video/group", {
      id: navId,
      offset,
    });
    wx.hideLoading();
    let videoList = groupListData.datas.map((item) => {
      item.id = index++;
      return item;
    });
    this.setData({
      videoList,
      isTriggered: false, //关闭下拉刷新
    });
  },
  //点击播放/继续播放的回调
  handlePlay(event) {
    /**
     * 1.点击播放之前需要找到上一个播放的视频
     * 2.在播放新的视频之前关闭上一个播放的视频
     * 关键
     * 	1.如何找到上一个视频的实例
     * 2.如何确认点击播放的视频和正在播放的视频不是同一个
     * 单例模式
     * 1.需要创建多个对象的场景下，通过一个变量接受，始终保持只有一个对象
     * 2.节省内存空间
     */
    let vid = event.currentTarget.id;
    //关闭上一个播放的视频
    //起初并没有这个实例，当点击视频就会创建
    //点击下一个视频时，就会暂停上一个已创建的视频实例
    // this.vid!==vid&&this.videoContext&&this.videoContext.stop()
    // this.vid = vid
    //更新data中的videoId
    this.setData({
      videoId: vid,
    });
    //创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid);
    //判断当前的视频是否播放过，有则跳转之前的播放记录
    let { videoUpdateTime } = this.data;
    let videoItem = videoUpdateTime.find((item) => item.vid === vid);
    if (videoItem) {
      this.videoContext.seek(videoItem.currentTime);
    }
  },
  //监听视频播放进度的回调
  handleTimeUpdate(event) {
    let videoTimeObj = {
      vid: event.currentTarget.id,
      currentTime: event.detail.currentTime,
    };
    let { videoUpdateTime } = this.data;
    /**
     * 判断记录播放时长的videoUpdateTime是否已有当前的视频播放记录
     * 有：在原有的播放记录中修改播放时间为当前的播放时间
     * 没有:则再数组中添加当前视频的播放对象
     */
    let videoItem = videoUpdateTime.find(
      (item) => item.vid === videoTimeObj.vid
    );
    //为true则说明之前已有该视频的播放记录
    if (videoItem) {
      videoItem.currentTime = event.detail.currentTime;
    } else {
      videoUpdateTime.push(videoTimeObj);
    }
    this.setData({
      videoUpdateTime,
    });
  },
  //视频播放结束调用
  handleTimeEnd(event) {
    let { videoUpdateTime } = this.data;
    let index = videoUpdateTime.findIndex(
      (item) => item.vid === event.currentTarget.id
    );
    videoUpdateTime.splice(index, 1);
    this.setData({
      videoUpdateTime,
    });
  },
  //下拉刷新回调发请求获取最新数据 :scroll-view
  handleRefresher() {
    this.getGroupList(this.data.navId);
  },
  //上拉刷新,加载更多数据
  handleToLower() {
    this.data.offset--
    this.data.offset++;
    this.getGroupList(this.data.navId, this.data.offset++);
    //数据分页:1.后端分页 2.前端分页
  },
  //跳转Search页
  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    //自定义转发内容
    return {
      title:"倾心音乐",
      page:'/page/video/video'
    }
  },
});
