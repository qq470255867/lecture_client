// app.js
App({
   serverUrl: "https://www.icycraft.cn/yl/",
  //  serverUrl: "http://192.168.101.53:8970",
  // serverUrl: "http://192.168.1.108:8080",
  onLaunch() {
    this.login();
  },
  globalData: {
    user: {
      id: '',
      name: '',
      avatar: '',
      clazzId: '',
      roleId: '',
      mail: '',
      wxId: ''
    },
    clazz: {
      id: '',
      name: '',
      pnum: '',
      code: ''
    },
    role: {
      id: '',
      name: ''
    }
  },
  login() {
    wx.login({
      success: res => {
        wx.showLoading();
        var tha = this;
        wx.request({
          url: this.serverUrl + '/login/get/openId/' + res.code,
          // 登录
          success: (result) => {
            var that = this;
            wx.setStorageSync('openId', result.data.data);

            wx.request({

              url: this.serverUrl + '/login/login/' + result.data.data,
              //获取用户
              success: (result) => {
                this.globalData.user = result.data.data;
                //获取角色
                wx.request({
                  url: this.serverUrl + '/role/get/' + this.globalData.user.roleId,
                  success: (result) => {
                    wx.hideLoading();
                    this.globalData.role = result.data.data;
                  },
                  fail: function (errMsg) {
                    wx.hideLoading();
                    that.showFailMessage(errMsg)
                  }
                })
                
                if (this.globalData.user.clazzId) {
                  //获取班级
                  wx.request({
                    url: this.serverUrl + '/clazz/get/' + this.globalData.user.clazzId,
                    success: (result) => {
                      this.globalData.clazz = result.data.data;
                      //获取角色
                    },
                    fail: function ({
                      errMsg
                    }) {
                      wx.hideLoading();
                      that.showFailMessage(errMsg)
                    }
                  })
                } else {
                  wx.hideLoading()
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
                }

              },
              fail: function ({
                errMsg
              }) {
                wx.hideLoading();
                that.showFailMessage(errMsg)
              }
            });
          },
          fail: function ({
            errMsg
          }) {
            wx.hideLoading();
            tha.showFailMessage(errMsg)
          }
        });
      },
      fail: function ({
        errMsg
      }) {
        this.showFailMessage(errMsg)
      }
    })
  },
  showFailMessage(ermsg) {
    wx.showModal({
      title: "很抱歉，小程序似乎出了点问题", // 提示的标题
      content: "请保存截图并及时联系作者,错误原因：" + ermsg, // 提示的内容
      showCancel: false, // 是否显示取消按钮，默认true
      cancelText: "取消", // 取消按钮的文字，最多4个字符
      cancelColor: "#000000", // 取消按钮的文字颜色，必须是16进制格式的颜色字符串
      confirmText: "OK", // 确认按钮的文字，最多4个字符
      confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
    })
  },
  validCode(code) {

    if (code == 200) {
      return true;
    } else if (code == 500) {
      return false;
    }
  },
  getUserAvatar: function () {
    wx.getUserProfile({
        desc: '用于微信账号与平台账号绑定',
        success: (res) => {
            console.log("获取到的用户信息成功: ", JSON.stringify(res));
            this.setData({
                userload: true,
                userInfo: res,
                userInfoStr: JSON.stringify(res)
            })
            let userobj = JSON.parse(this.data.userInfo.rawData);
            app.globalData.user.avatar = userobj.avatarUrl;
            wx.request({
                url: app.serverUrl + '/user/update/',
                data: app.globalData.user,
                header: {
                    'content-type': 'application/json'
                },
                method: 'POST',
                success: function (res) {
                    if (app.validCode(res.data.code)) {

                    } else {
                        app.showFailMessage(res.data.message)
                    }
                },
                fail: function (e) {
                    app.showFailMessage(e)
                }
            })
        },
        fail: (res) => {
            console.log("获取用户个人信息失败: ", res);
            //用户按了拒绝按钮
            wx.showModal({
                title: 'sorry',
                content: '勉强应允不如坦诚拒绝。 —— 雨果',
                showCancel: false,
                confirmText: '当然！',
                success: function (res) {
                    // 用户没有授权成功，不需要改变 isHide 的值
                    if (res.confirm) {
                        console.log('用户点击了“返回授权”');
                    }
                }
            });
        }
    })
}


})