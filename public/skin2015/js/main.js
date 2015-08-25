/*
  auther:f7
  date:2015.7
*/

requirejs.config({
    paths: {
        jquery: [
            './jquery-1.11.1.min'
        ],
        dialog: './dialog.3.1.min',
        activeJoin: './activeJoin'
    },
    shim: {
        
    }
});


/**
 * =============  公共方法  =============
 */


/**
 * 登录页面相关效果
 * @return
 */
function loginPage() {
    if ( !document.getElementById("js-loginForm") ) { return false };
    require(["member"], function(member) {
        member.login(document.getElementById("js-loginForm"), function(data) {
            if ( data.status == 200 && data.code && data.code == 1 ) {// 登录成功
                if ( data.url ) {
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
                if ( data.url ) {
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
 * 活动报名JS初始化
 * @return
 */
function activeJoin() {
    if ( !document.getElementById("js-active-join") ) { return false };
    require(["activeJoin"], function(activeJoin) {
        activeJoin.init();
    });
};


/**
 * 开启中的活动【写在Head上的红标】
 * @return
 */
function openActive() {
    var elem = $("#js-openActive-count");
    $.get("/active/open", function(data) {
        if ( !data ) { return false };
        if ( typeof data == "string" ) {
            data = $.parseJSON(data);
        }

        if ( data.status ) {// 成功
            if ( data.count > 0 ) {
                elem.html(data.count).show();
            }
        };
    });
};


require(["jquery", "dialog"], function($, Dialog) {
    activeJoin();

    openActive();

    loginPage();
    regPage();
    forgotPasswordPage();
    resetPasswordPage();
});

