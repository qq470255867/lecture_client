// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    wx2wmUrl:'https://icycraft.cn/pic/2wm.jpg',
    faq: [],
    isupload1: false,
    isupload2: false,
    isupload3: false,
    isupload4: false,
    isupload5: false,
    img1: '',
    img2: '',
    img3: '',
    img4: '',
    img5: '',
    zxdisable: true,
    ujdisable: true,
    subDisable:true,
    lecture:{}
  },

  onLoad() {
    this.clearPost()
    this.getFaq()
    this.getCurLec()
    this.showShareMenu()
  },
  showShareMenu(){
    wx.showShareMenu({
 
      withShareTicket:true,
       
      menus:['shareAppMessage','shareTimeline']
       
      })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getCurLec(){
    wx.request({
      url: app.serverUrl+'/lec/get/curLecture',
      success:(r)=> {
          if(app.validCode(r.data.code)){
             this.setData({
                 lecture:r.data.data
             })
          }else{
            app.showFailMessage(r.data.message)
          }
     
      },
      fail:function(e){
        app.showFailMessage(e.errMsg)
      }
    })
},
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  chooseImage1() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        console.log(res)
        this.setData({
          img1: res.tempFilePaths[0],
          isupload1: true
          
        })
        this.validCanSubmit()
      }
    });

  },
  chooseImage2() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        console.log(res)
        this.setData({
          img2: res.tempFilePaths[0],
          isupload2: true
        })
        this.validCanSubmit()
      }
    });

  },
  chooseImage3() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        console.log(res)
        this.setData({
          img3: res.tempFilePaths[0],
          isupload3: true
        })
        this.validCanSubmit()
      }
    });

  },
  chooseImage4() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        console.log(res)
        this.setData({
          img4: res.tempFilePaths[0],
          isupload4: true
        })
        this.validCanSubmit()
      }
    });

  },
  chooseImage5() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        console.log(res)
        this.setData({
          img5: res.tempFilePaths[0],
          isupload5: true
        })
        this.validCanSubmit()
      }
    });

  },
  onShow: function () {

  },
  showScuessMessage(){
    if(this.data.isupload1&&this.data.isupload2&&this.data.isupload3&&this.data.isupload4&&this.data.isupload5){
      wx.showModal({
        title: '成功',
        content: '感谢，欢迎下次继续使用',
        showCancel: false,
        confirmText: 'OK',
        success:(r)=>{
          this.addRecord()
        }
      })
    }

  },
  openDownLoad() {
    this.setData({
      zxdisable: false
    })
  },
  post() {

    if (!(this.data.img1 && this.data.img2 && this.data.img3 && this.data.img4 && this.data.img5)) {
      wx.showToast({
        title: '请上传完整图片',
        icon: 'error',
        mask: true,
        duration: 1000
        
      })
      return
    }
    if(!app.globalData.user.name){
      wx.showModal({
        title: '温馨提示',
        content: '姓名为空，请完善资料后继续使用',
        showCancel: false,
        confirmText: '前往',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/edit/edit',
            })
          }
        }
      })
      return
    }
    if(!app.globalData.clazz.id){
      wx.showModal({
        title: '温馨提示',
        content: '未找到班级信息，请完善资料后继续使用',
        showCancel: false,
        confirmText: '前往',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/edit/edit',
            })
          }
        }
      })
      return
    }
    wx.showToast({
      title: '正在上传...',
      icon: 'loading',
      mask: true,
      duration: 7000
    })
    var that = this
    var timeOut = setTimeout(function () {
      that.showScuessMessage()
      that.clearPost()
    }, 7000)
    let img = [
      '0',
      this.data.img1,
      this.data.img2,
      this.data.img3,
      this.data.img4,
      this.data.img5,
    ]
    console.log(app.globalData.user.id)
    for (var i = 1; i < 6; i++) {
      wx.uploadFile({
        filePath: img[i],
        name: 'file',
        url: app.serverUrl + '/upload/file/' + 'img' + i + '/'  + app.globalData.user.id,
        success:(r) => {
          console.log(r.data)
          let data = JSON.parse(r.data)
          if(app.validCode(data.code)){
             this.setData({
                 
             })
          }else{
            app.showFailMessage(r.data.message)
          }
     
      },
      fail:function(e){
        app.showFailMessage(e.errMsg)
      }
      })
    }
  },
  addRecord(){
    wx.request({
      url: app.serverUrl+'/record/add/'+app.globalData.user.id,
      success:(r)=> {
          if(app.validCode(r.data.code)){
             this.setData({
                 
             })
          }else{
            app.showFailMessage(r.data.message)
          }
     
      },
      fail:function(e){
        app.showFailMessage(e.errMsg)
      }
    })
  },
  postMail() {
    wx.showToast({
      title: '正在发送',
      icon: 'loading',
      mask: true,
      duration: 5000
    })
    wx.request({
      url: app.serverUrl + '/postMail/' + this.data.name + '/' + this.data.mail,
      success: (result) => {
        wx.showToast({
          title: '发送成功',
        })
      }
    })
  },
  downloadZip() {
    let that = this
    wx.showToast({
      title: '正在下载',
      icon: 'loading',
      mask: true,
      duration: 10000
    })
    wx.downloadFile({ //下载
      url: app.serverUrl + '/download/' + this.data.name,
      filePath: wx.env.USER_DATA_PATH + '/' + this.data.name + '青年大学习.zip', //自定义文件地址
      success: function (res) {
        wx.openDocument({ //打开
          filePath: wx.env.USER_DATA_PATH + '/' + that.data.name + '青年大学习.zip',
          success: function (res) {}
        })

      }
    })
  },
  inputchange(e) {
    let value = e.detail.value
    this.setData({
      name: value
    })
  },
  inputchange2(e) {
    let value = e.detail.value
    this.setData({
      mail: value
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {


    }

  },
  onShareTimeline: function (res) {
    return {

    }
  },
  getFaq() {
    wx.request({
      url: app.serverUrl + '/faq/get',
      success: (re) => {
        if (app.validCode(re.data.code)) {
          this.setData({
            faq: re.data.data
          })
        } else {
          app.showFailMessage(re.data.message);
        }
      },
      fail: function (e) {
        app.showFailMessage(e.errMsg);
      }
    })
  },
  clearPost(){
    this.setData({
      img1:'',
      img2:'',
      img3:'',
      img4:'',
      img5:'',
      subDisable:true
    })
  },
  validCanSubmit(){
    if(this.data.img1&&this.data.img2&&this.data.img3&&this.data.img4&&this.data.img5){
      this.setData({
        subDisable:false
      })
    
    }
  },

  preview: function (e) {
    var imgUrl = this.data.wx2wmUrl;
    wx.previewImage({
      urls: [imgUrl], //需要预览的图片http链接列表，注意是数组
      current: '', // 当前显示图片的http链接，默认是第一个
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    })
  }





})