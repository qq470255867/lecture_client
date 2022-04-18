// pages/my/my.js
var app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {

      create:{

        school:'',
        clazz:'',
        name:'',
        mail:'',
        info:'',
        wxId: app.globalData.user.wxId
        
      },
      confirmdisabled:true
    },
    bindSnameChange: function (e) {
        
        this.setData({
            'create.school': e.detail.value
        })
        this.setConfirmDisAble()
    },
    bindCnameChange: function (e) {
        this.setData({
            'create.clazz': e.detail.value
        })
        this.setConfirmDisAble()
    },
    bindMnameChange: function (e) {
        this.setData({
            'create.name': e.detail.value
        })
        this.setConfirmDisAble()
    },
    bindmailChange: function (e) {
        this.setData({
            'create.mail': e.detail.value
        })
        this.setConfirmDisAble()
    },
    bindinfoChange: function (e) {
        this.setData({
            'create.info': e.detail.value
        })
        this.setConfirmDisAble()
    },
    setConfirmDisAble(){
        if(this.data.create.school&&this.data.create.clazz&&this.data.create.name&&this.data.create.mail){
            this.setData({
                confirmdisabled:false
            })
        }else {
            this.setData({
                confirmdisabled:true
            })
        }
    },
    postCreate(){
        let str = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
        if(!str.test(this.data.create.mail)){
            wx.showToast({
                icon: 'error',
                title: '邮箱格式有误',
            })
            return
        }

        this.setData({
            'create.wxId': app.globalData.user.wxId
        })
        wx.showLoading({
            mask:true
        })
        wx.request({
            url: app.serverUrl + '/clazz/create',
            header: {
                'content-type': 'application/json'
            },
            method: 'POST',
            data: this.data.create,
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    this.setData({
                        create:{}
                    })
                    wx.showModal({
                        title: '请求成功',
                        content: '创建班级的请求已通知管理员审核，请耐心等待邮件回复',
                        showCancel: false,
                        confirmText: 'OK！',
                        success(res) {
                            if (res.confirm) {
                                wx.navigateBack({
                                    delta: 0,
                                  })
                            }
                          }
                      })
                    wx.hideLoading()
                } else {
                    app.showFailMessage(r.data.message)
	                wx.hideLoading()
                }

            },
            fail: function (e) {
                app.showFailMessage(e.errMsg)
              	wx.hideLoading()
            }
        })
    }

})