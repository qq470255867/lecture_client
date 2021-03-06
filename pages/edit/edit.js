// pages/edit/edit.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        user: {},
        clazz: {},
        role: {},
        defaultPickIndex: -1,
        userWantChangeClazzId: '',
        inputNotCorrect: false,
        codeModalShow: false,
        clazzs: [],
        confirmdisabled: true,
        code:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getClazzs()
       
    },

    updateData() {

        wx.showLoading()
        //更新用户数据
        this.setData({
            'user.avatar': app.globalData.user.avatar
        })
        if (!this.data.user.name) {
            wx.showToast({
                title: '姓名不能为空',
                icon: 'error',
                mask: true,
                duration: 1000
            })
            return
        }
        wx.request({

            url: app.serverUrl + '/user/update/',
            data: this.data.user,
            header: {
                'content-type': 'application/json'
            },
            method: 'POST',
            success: (res) => {

                if (app.validCode(res.data.code)) {
                    //更新全局数据
                    //用户
                    app.globalData.user = this.data.user
                    wx.request({
                        url: app.serverUrl + '/clazz/get/' + this.data.user.clazzId,
                        success: (r) => {
                            if (app.validCode(r.data.code)) {

                                //班级
                                if (this.data.role.id > 0) {
                                    wx.request({
                                        data: this.data.clazz,
                                        header: {
                                            'content-type': 'application/json'
                                        },
                                        method: 'POST',
                                        url: app.serverUrl + '/clazz/update',
                                        success: (r) => {
                                            if (app.validCode(r.data.code)) {
                                                this.setData({
                                                    clazz: r.data.data
                                                })
                                                app.globalData.clazz = r.data.data
                                            } else {
                                                app.showFailMessage(r.data.message)
                                            }

                                        },
                                        fail: function (e) {
                                            app.showFailMessage(e.errMsg)
                                        }
                                    })
                                }
                            } else {
                                app.showFailMessage(r.data.message)
                            }

                        },
                        fail: function (e) {
                            app.showFailMessage(e.errMsg)
                        }
                    })
                    wx.hideLoading()
                    wx.navigateBack()
                } else {
                    app.showFailMessage(res.data.message)
                }
            },
            fail: function (e) {
                app.showFailMessage(e.errMsg)
            }
        })
    },
    getClazzs() {
        wx.request({
            url: app.serverUrl + '/clazz/get/list',
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    this.setData({
                        clazzs: r.data.data
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
    setDefaultData() {
        let id = app.globalData.user.id
        wx.showLoading({
            mask: true
        })
        wx.request({
            url: app.serverUrl + '/user/get/' + id,
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    this.setData({
                        user: r.data.data,
                    })
                    wx.showLoading({
                        mask: true
                    })
                    wx.request({
                        url: app.serverUrl + '/clazz/get/' + this.data.user.clazzId,
                        success: (r) => {
                            if (app.validCode(r.data.code)) {
                                this.setData({
                                    clazz: r.data.data
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


                    wx.hideLoading()
                } else {
                    app.showFailMessage(r.data.message)
                }

            },
            fail: function (e) {
                app.showFailMessage(e.errMsg)
            }
        })
        let gbData = app.globalData
        this.setData({
            defaultPickIndex: gbData.clazz.id,
            clazz: gbData.clazz,
            role: gbData.role
        })


    },
    handleClazzChange: function (e) {
        this.setData({
            userWantChangeClazzId: e.detail.value
        })
        this.setData({
            codeModalShow: true
        })
    },
    handleCodeOK() {

        if (!this.data.code&&this.data.userWantChangeClazzId!=0) {
            return
        }
        if (this.data.userWantChangeClazzId==0) {
            this.setData({
                codeModalShow: false,
                inputNotCorrect: false,
                code: '',
                defaultPickIndex: this.data.userWantChangeClazzId,
                'user.clazzId': this.data.userWantChangeClazzId,
                clazz: {
                    id:0,
                    name:'内容体验',
                    pnum:1,
                    code:1,
                    realPnum:1
                },
            })
            app.globalData.clazz = this.data.clazz
            this.setConfirmDisAble()
            return
        }
        wx.showLoading()
        wx.request({
            url: app.serverUrl + '/clazz/valid/' + this.data.code + '/' + this.data.userWantChangeClazzId,
            success: (r) => {
                if (app.validCode(r.data.code)) {
                    if (r.data.data) {
                        this.setData({
                            codeModalShow: false,
                            inputNotCorrect: false,
                            code: '',
                            defaultPickIndex: this.data.userWantChangeClazzId,
                            'user.clazzId': this.data.userWantChangeClazzId,
                            clazz: r.data.data,

                        })
                        app.globalData.clazz = r.data.data
                        wx.hideLoading({
                            success: (res) => {},
                        })
                        this.setConfirmDisAble()
                    } else {
                        this.setData({
                            codeModalShow: true,
                            inputNotCorrect: true
                        })
                        wx.hideLoading({
                        })
                    }

                } else {
                    app.showFailMessage(r.data.message)
                    wx.hideLoading({
                        success: (res) => {},
                    })
                }

            },
            fail: function (e) {
                app.showFailMessage(e.errMsg)
                wx.hideLoading({
                    success: (res) => {},
                })
            }
        })

        // this.setData({
        //     inputNotCorrect: true
        // })


    },
    handCodedNo() {
        this.setData({
            codeModalShow: false,
            inputNotCorrect: false,
            code: ''
        })
    },
    bindChaneName: function (e) {

        this.setData({
            'user.name': e.detail.value
        })
        this.setConfirmDisAble()
    },
    bindChaneCode: function (e) {
        this.setData({
            'clazz.code': e.detail.value
        })
        this.setConfirmDisAble()
    },
    bindCodeInput: function(e) {
        this.setData({
            code:e.detail.value
        })
    },
    bindChaneCName: function (e) {
        this.setData({
            'clazz.name': e.detail.value
        })
        this.setConfirmDisAble()
    },
    bindChanePnum: function (e) {
        this.setData({
            'clazz.pnum': e.detail.value
        })
        this.setConfirmDisAble()
    },
    bindChaneMail: function (e) {
        this.setData({
            'user.mail': e.detail.value
        })
        this.setConfirmDisAble()
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
        this.setDefaultData();
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

    },
    setConfirmDisAble() {
        if (this.data.user.name && this.data.user.clazzId >= 0 && this.data.clazz.name && this.data.clazz.pnum && this.data.clazz.code) {
            this.setData({
                confirmdisabled: false
            })
        } else {
            this.setData({
                confirmdisabled: true
            })
        }
    }
})