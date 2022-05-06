import request from "../../../utils/request";
import PubSub from "pubsub-js";
import moment from "moment";
//获取全局实例
const appInstance = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, //标识音乐是否播放
    musicId: "",
    song: {},
    musicLink: "", //获取当前音乐播放链接
    currentTime: "00:00", //音乐开始时间
    durationTime: "00:00", //音乐总时长
    currentWidth: 0, //实时进度条长度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options接受路由传递的参数
    //原生小程序路由传参，对参数的长度有限制，长度过长会自动截取
    let musicId = options.musicId;
    this.setData({
      musicId,
    });
    this.getMusicInfo(musicId);
    //判断当前音乐是否播放
    if (
      appInstance.globalData.isMusicPlay &&
      appInstance.globalData.musicId == musicId
    ) {
      this.setData({
        isPlay: true,
      });
    }
    /**
     * 控制音频播放实例使其与播放/暂停/停止按钮状态一致
     */
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.backgroundAudioManager.onPlay(() => {
      //修改音乐播放
      this.changePlay(true);

      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      this.changePlay(false);
    });
    //停止
    this.backgroundAudioManager.onStop(() => {
      this.changePlay(false);
    });
    //监听音乐播放结束下一首
    this.backgroundAudioManager.onEnded(()=>{
      PubSub.publish("switchType", 'next');
      this.musicControl(true, musicId);
      this.getMusicInfo(musicId);
      //还原进度条长度
      this.setData({
        currentWidth:0,
        currentTime: "00:00"
      })
    })
    //监听音乐播放进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      let currentTime = moment(
        this.backgroundAudioManager.currentTime * 1000
      ).format("mm:ss");
      let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration * 450
      this.setData({
        currentTime,
        currentWidth
      });
    });
  },
  //修改播放状态函数
  changePlay(isPlay) {
    this.setData({
      isPlay,
    });
    //修改全局音乐播放状态
    appInstance.globalData.isMusicPlay = isPlay;
  },
  //点击暂停/播放音乐状态
  playStatus() {
    let isPlay = !this.data.isPlay;
    let { musicId, musicLink } = this.data;
    this.musicControl(isPlay, musicId, musicLink);
  },
  //获取音乐详情数据
  async getMusicInfo(musicId) {
    let songData = await request("/song/detail", { ids: musicId });
    let durationTime = moment(songData.songs[0].dt).format("mm:ss");
    this.setData({
      song: songData.songs[0],
      durationTime,
    });
    //动态更改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name,
    });
  },
  //点击暂停/播放音乐功能
  async musicControl(isPlay, musicId, musicLink) {
    //获取音乐播放链接
    //如果没有当前播放链接则发请求，否则不发，优化性能，不会重复发送相同请求

    if (isPlay) {
      if (!musicLink) {
        let musicLinkData = await request("/song/url", { id: musicId });
        musicLink = musicLinkData.data[0].url;
        this.setData({
          musicLink,
        });
      }
      //播放
      //创建音频实例
      this.backgroundAudioManager.src = musicLink;
      this.backgroundAudioManager.title = this.data.song.name;
    } else {
      //暂停音乐
      this.backgroundAudioManager.pause();
    }
  },
  //切换音乐
  handleSwitchMusic(event) {
    let preOrNext = event.currentTarget.id;
    //切歌时关闭当前播放音乐
    this.backgroundAudioManager.stop();
    //接受recommend传来的musicId
    PubSub.subscribe("receiveMusicId", (msg, musicId) => {
      this.getMusicInfo(musicId);
      this.musicControl(true, musicId);
      //切换后自动播放音乐
      PubSub.unsubscribe("receiveMusicId");
    });
    //传输数据给推荐页
    PubSub.publish("switchType", preOrNext);
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
  onShareAppMessage: function () {},
});
