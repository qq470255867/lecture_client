// pages/my/my.js
var app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        pickData: ['全部', '已提交', '未提交'],
        defaultPickIndex: 0,
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
            code: '',
            realPnum:''
        },
        role: {
            id: '',
            name: ''
        },
        lecture: {
            id: '',
            name: '',
            date: ''
        },
        record: {
            id: '',
            userId: '',
            lecId: '',
            date: ''
        },
        submitNum: 0,
        allSubmitedList: [],
        submitedList: [],
        notSubmitedList: [],
        lectures: [],
        lecModal:false,
        newLecName:'',
        notGetSubListStatus:true,
        faqlist:[],
        create_reqs:[],
        create_req:{},
        reqIndex:0,
        reqNum:0,
        hasReq:false
    },
    deleteZip(){
        wx.showModal({
            title: '提示',
            content: '撤销后无法恢复，确定吗',
            success: (res)=> {
              if (res.confirm) {
                  wx.showLoading({
                    title: '删除中',
                  })
                wx.request({
                    url: app.serverUrl+'/delete/'+app.globalData.user.id,
                    success:(r)=> {
                        if(app.validCode(r.data.code)){
                            this.setData({
                                record:{}
                            })
                            wx.showToast({
                              title: '删除成功',
                            })
                            wx.hideLoading()
                        }else{
                          app.showFailMessage(r.data.message)
                          wx.hideLoading()
                        }
                   
                    },
                    fail:function(e){
                      app.showFailMessage(e.errMsg)
                      wx.hideLoading()
                    }
                  })
              } 
            }
          })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.refreshGlobal();
        this.getClazzCreateFaq();
        this.getCreateReqs();
    },
    onShow: function () {
        this.refreshGlobal();
        this.getCurLec();
        this.getLastRecord();
        if (this.data.role.id > 0) {
            this.getSubmitedListNum();
            this.getListWithStatus();
        }
        if (this.data.role.id > 1) {
            this.getHistoryLectures();
        }
        
    },
    getUserById(){
    },
    showShareMenu (){
        wx.showShareMenu({
     
          withShareTicket:true,
           
          menus:['shareAppMessage','shareTimeline']
           
          })
        },
    showNewLecModal(){
        this.setData({
            lecModal:true,
            newLecName:''
        })
    },
    handLecAddOK(){
        if(this.data.newLecName.length<3){
            wx.showToast({
              title: '名字太短了',
              duration: 3000,
              icon:'loading'
            })
            return;
        }
        this.setData({
            lecModal:false
        })
        let lec = {
            'name':this.data.newLecName
        }
        let that = this;
        wx.request({
            url: app.serverUrl + '/lec/addLectures/',
            data: lec,
            header: {
                'content-type': 'application/json'
            },
            method: 'POST',
            success: function (res) {
                if (app.validCode(res.data.code)) {
                    that.getHistoryLectures()
                } else {
                    app.showFailMessage(res.data.message)
                }
            },
            fail: function (e) {
                app.showFailMessage(e)
            }
        })
      
    },
    handLecAddNo(){
        this.setData({
            lecModal:false
        })
    },
    postEmail(){
        let str = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
	
	if (str.test(this.data.user.mail)) {
        wx.showLoading({
          title: '发送中',
          mask:true
        })
        wx.request({
            url: app.serverUrl+'/mail/'+this.data.user.id,
            success:(r)=> {
                if(app.validCode(r.data.code)){
                    wx.showModal({
                        title: '发送成功',
                        content: '文件较大，可能会有一定网络延迟，请耐心等待',
                        showCancel: false,
                        confirmText: '好的',
                    })
                   wx.hideLoading({
                     success: (res) => {},
                   })
                }else{
                  app.showFailMessage(r.data.message)
                }
           
            },
            fail:function(e){
              app.showFailMessage(e.errMsg)
            }
          })
	}else {
		/*格式不正确，弹窗提示*/
		wx.showToast({
            icon: 'error',
			title: '邮箱格式有误',
		})
	}
    },
    getHistoryLectures() {
        wx.request({
            url: app.serverUrl + '/lec/getLectures',
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    this.setData({
                        lectures:r.data.data
                    })
                } else {
                    app.showFailMessage(r.data.message)
                }

            },
            fail: function (e) {
                app.showFailMessage(e.errMsg)
            }
        })
    },
    bindPickerChange: function (e) {
        this.setData({
            defaultPickIndex: e.detail.value
        })
    },
    getListWithStatus() {
        wx.request({
            url: app.serverUrl + '/user/get/clazz/with/status/' + this.data.clazz.id,
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    this.setData({
                        allSubmitedList: r.data.data,
                        notGetSubListStatus:false
                    })

                    let data = r.data.data;
                    for (var i in data) {
                        if (data[i].status) {
                            this.setData({
                                submitedList: this.data.submitedList.concat(data[i])
                            })
                        } else {
                            this.setData({
                                notSubmitedList: this.data.notSubmitedList.concat(data[i])
                            })
                        }

                    }
                } else {
                    app.showFailMessage(r.data.message)
                }

            },
            fail: function (e) {
                app.showFailMessage(e.errMsg)
            }
        })
    },
    downloadZip() {
        let that = this
        wx.showToast({
          title: '正在下载',
          icon: 'loading',
          mask: true,
          duration: 5000
        })
        wx.downloadFile({ //下载
          url: app.serverUrl + '/download/' + this.data.user.id,
          filePath: wx.env.USER_DATA_PATH + '/' + this.data.user.name + '青年大学习.zip', //自定义文件地址
          success: function (res) {
            wx.openDocument({ //打开
              filePath: wx.env.USER_DATA_PATH + '/' + that.data.user.name + '青年大学习.zip',
              success: function (res) {

              }
            })
    
          }
        })
      },

    getSubmitedListNum() {
        wx.request({
            url: app.serverUrl + '/record/submited/list/' + this.data.clazz.id,
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    this.setData({
                        submitNum: r.data.data.length
                    })
                } else {
                    app.showFailMessage(r.data.message)
                }

            },
            fail: function (e) {
                app.showFailMessage(e.errMsg)
            }
        })
    },
    getLastRecord() {
        wx.request({
            url: app.serverUrl + '/record/submit/' + this.data.user.id,
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    this.setData({
                        record: r.data.data
                    })
                } else {
                    app.showFailMessage(r.data.message)
                }

            },
            fail: function (e) {
                app.showFailMessage(e.errMsg)
            }
        })
    },
    getCurLec() {
        wx.request({
            url: app.serverUrl + '/lec/get/curLecture',
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    this.setData({
                        lecture:r.data.data
                    })
                } else {
                    app.showFailMessage(r.data.message)
                }

            },
            fail: function (e) {
                app.showFailMessage(e.errMsg)
            }
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    export(){
        let that = this
        wx.showToast({
          title: '正在打印',
          icon: 'loading',
          mask: true,
          duration: 1000
        })
        wx.downloadFile({
            url: app.serverUrl+'/record/report/excel/'+this.data.clazz.id+'/'+this.data.defaultPickIndex,
            filePath: wx.env.USER_DATA_PATH + '/' + this.data.lecture.name+this.data.clazz.name + '记录.xlsx', //自定义文件地址
            success:(r)=> {
                wx.openDocument({ //打开
                    filePath: wx.env.USER_DATA_PATH + '/' + this.data.lecture.name+this.data.clazz.name + '记录.xlsx',
                    success: function (res) {}
                  })
           
            },
            fail:function(e){
                console.log(e)
              app.showFailMessage(e.errMsg)
            }
          })
    },
    /**
     * 生命周期函数--监听页面显示
     */


    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.setData({
            allSubmitedList: [],
            submitedList: [],
            notSubmitedList: [],
        })
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

    },
    refreshGlobal() {
        this.setData({
            user: app.globalData.user,
            clazz: app.globalData.clazz,
            role: app.globalData.role,
            notGetSubListStatus:true
        })
    },
    toCreateClazz(){
        wx.navigateTo({
            url: '/pages/create/create',
        })
    },
    getClazzCreateFaq(){
        wx.showLoading({
            mask:true
        })
        wx.request({
            url: app.serverUrl + '/clazz/faq/list',
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    this.setData({
                        faqlist:r.data.data
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
    },

    
    edit() {
        this.getUserAvatar();
        this.refreshGlobal();
        wx.navigateTo({
            url: '/pages/edit/edit',
        })
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
    },
    getCreateReqs() {
        wx.showLoading({
            mask:true
        })
        wx.request({
            url: app.serverUrl + '/clazz/get/list/create',
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    if(r.data.data.length>0){
                        this.setData({
                            hasReq:true
                        })
                        this.setData({
                            create_reqs:r.data.data,
                            create_req:r.data.data[this.data.reqIndex],
                            reqNum:r.data.data.length
                        })
                    }else {
                        this.setData({
                            hasReq:false
                        })
                    }


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
    },
    nextCreateReq(){
        if(this.data.reqNum>1){
            this.setData({
                reqIndex: this.data.reqIndex+1,
            })
            console.log(this.data.create_reqs[this.data.reqIndex])
            this.setData({
                create_req : this.data.create_reqs[this.data.reqIndex]
            })
            this.setData({
                reqNum:this.data.reqNum-1
            })
        }else  {
            this.setData({
                hasReq:false,
                reqNum:this.data.reqNum-1
            })
        }
    },
    passReq(){
        wx.showLoading({
            mask:true
        })
        wx.request({
            url: app.serverUrl + '/clazz/deal/create/req/'+this.data.create_req.id+'/1',
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    wx.showToast({
                      title: '完成',
                    })
                    //删除处理的请求
                    this.nextCreateReq()
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
    },

    rejectReq(){
        wx.showLoading({
            mask:true
        })
        wx.request({
            url: app.serverUrl + '/clazz/deal/create/req/'+this.data.create_req.id+'/2',
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    wx.showToast({
                      title: '完成',
                    })
                    this.nextCreateReq()
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