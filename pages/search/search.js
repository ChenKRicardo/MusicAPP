import request from "../../utils/request";
let isOpen = false;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: "",
    hotList: [],
    searchContent: "",
    searchList: [], //搜索后的数据
    historyList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInitData();
    this.getHistoryList();
  },
  getHistoryList() {
    //获取本地历史记录信息
    let historyList = wx.getStorageSync("searchHistory");
    if (historyList) {
      this.setData({
        historyList,
      });
    }
  },
  //获取初始数据
  async getInitData() {
    let placeholderData = await request("/search/default");
    let hotListData = await request("/search/hot/detail");
    let index = 0;
    let hotItem = hotListData.data.map((item) => {
      item.id = index++;
      return item;
    });
    this.setData({
      placeholderContent: placeholderData.data.realkeyword,
      hotList: hotItem,
    });
  },
  //搜索歌曲
  handleInput(event) {
    this.setData({
      searchContent: event.detail.value.trim(),
    });
    //节流
    if(isOpen){
      return
    }
    isOpen = true
    this.getSongList();
    setTimeout(() => {
      isOpen = false
    }, 1000);
  },
  async getSongList() {
    if (!this.data.searchContent) {
      this.setData({
        searchList: [],
      });
      return;
    }
    let { searchContent, historyList } = this.data;
    let searchListData = await request("/search", {
      keywords: searchContent,
      limit: 10,
    });
    this.setData({
      searchList: searchListData.result.songs,
    });
    //将搜索的关键字添加到搜索记录中
    if (historyList.indexOf(searchContent) !== -1) {
      historyList.splice(historyList.indexOf(searchContent), 1);
    }
    this.setData({
      historyList,
    });
    this.getHistoryList();
    historyList.unshift(searchContent);
    wx.setStorageSync("searchHistory", historyList);
  },
  //清空搜索内容
  clear() {
    this.setData({
      searchList: [],
      searchContent: "",
    });
  },
  delHistoryList() {
    wx.showModal({
      content: "确定删除所有历史记录吗?",
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync("searchHistory");
          this.setData({
            historyList: [],
          });
        }
      },
    });
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
