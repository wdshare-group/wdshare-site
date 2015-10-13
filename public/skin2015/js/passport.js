define(["jquery"], function(){
    
    /**
     * 登录页面相关效果
     * @return
     */
    function loginPage() {
        if ( !document.getElementById("js-loginForm") ) { return false };
        require(["member"], function(member) {
            member.login(document.getElementById("js-loginForm"), function(data) {
                if ( data.status == 200 && data.code && data.code == 1 ) {// 登录成功
                    if ( getUrlParam("referer") ) {
                        window.location = getUrlParam("referer");
                    } else if ( data.url ) {
                        window.location = data.url;
                    }
                } else {// 登录失败
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false
                    });
                }
                
            });
        });
    };


    /**
     * 注册页面相关效果
     * @return
     */
    function regPage() {
        if ( !document.getElementById("js-regForm") ) { return false };
        require(["member"], function(member) {
            member.reg(document.getElementById("js-regForm"), function(data) {
                if ( data.status == 200 && data.code && data.code == 1 ) {// 注册成功
                    if ( getUrlParam("referer") ) {
                        window.location = getUrlParam("referer");
                    } else if ( data.url ) {
                        window.location = data.url;
                    }
                } else {// 注册失败
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false
                    });
                }
                
            });
        });
    };

    /**
     * 密码找回页面相关效果
     * @return
     */
    function forgotPasswordPage() {
        if ( !document.getElementById("js-forgotPasswordForm") ) { return false };
        require(["member"], function(member) {
            member.forgotPassword(document.getElementById("js-forgotPasswordForm"), function(data) {
                if ( data.status == 200 && data.code && data.code == 1 ) {// 注册成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onClose":function() {
                            if ( data.url ) {
                                window.location = data.url;
                            }
                        },
                        "onSubmit":function() {
                            if ( data.url ) {
                                window.location = data.url;
                            }
                        }
                    });
                    
                } else {// 注册失败
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onClose":function() {
                            document.getElementById("js-forgotPasswordForm").email.select();
                        },
                        "onSubmit":function() {
                            document.getElementById("js-forgotPasswordForm").email.select();
                        }
                    });
                }
                
            });
        });
    };

    /**
     * 密码找回后输入新密码
     * @return
     */
    function resetPasswordPage() {
        if ( !document.getElementById("js-resetPasswordForm") ) { return false };
        require(["member"], function(member) {
            member.resetPassword(document.getElementById("js-resetPasswordForm"), function(data) {
                if ( data.status == 200 && data.code && data.code == 1 ) {// 新密码成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onClose":function() {
                            if ( data.url ) {
                                window.location = data.url;
                            }
                        },
                        "onSubmit":function() {
                            if ( data.url ) {
                                window.location = data.url;
                            }
                        }
                    });
                    
                } else {// 新密码失败
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onClose":function() {
                            document.getElementById("js-resetPasswordForm").password.select();
                        },
                        "onSubmit":function() {
                            document.getElementById("js-resetPasswordForm").password.select();
                        }
                    });
                }
                
            });
        });
    };


    /**
     * 注册点击重新获取激活邮件
     * @return
     */
    function reGetActiveAccountMail() {
        if ( !document.getElementById("reGetActiveAccountMail") ) {
            return false;
        }

        $("#reGetActiveAccountMail").click(function() {
            $.get("/user/activeAccountAjax", function(data) {
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false
                });
            })
            return false;
        });
    };

    /**
     * 发起用户激活
     * @return
     */
    function requestUserActive() {
        // requestActiveCode 这个是页面在符合激活条件时输出的
        if ( typeof requestActiveCode == "undefined" || !requestActiveCode ) {
            return false;
        }
        
        $.get("/user/activeAccountAjax/"+requestActiveCode, function(data) {
            Dialog({
                "msg":"<br />"+ data.message +"<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onClose":function() {
                    if ( data.url ) {
                        window.location = data.url;
                    }
                },
                "onSubmit":function() {
                    if ( data.url ) {
                        window.location = data.url;
                    }
                }
            });
        })
    };

    var passport = {};
    passport.init = function() {
        loginPage();
        regPage();
        forgotPasswordPage();
        resetPasswordPage();
        reGetActiveAccountMail();
        requestUserActive();
    };


    return passport;
});