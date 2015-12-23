define(['jquery', 'dialog'], function($, wx) {
    function chackMail(str) {
        var re = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]*)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        return (re.test(str));
    };

    var member = {};
    member.login = function(form, callback) {
        var that = this;
        $(form).submit(function() {
            if ( that.loginCheck(form) ) {
                $(".login-subhead").show();
                $(".login-error").hide();
                that.loginSubmit(form);
            }
            return false;
        });
        this.loginCallback = callback;

        form.email.select();
    };
    member.loginError = function(str) {
        $(".login-subhead").hide();
        $(".login-error").html(str).show();
    };
    member.loginCheck = function(form) {
        var email = form.email,
            password = form.password,
            code = form.code;
        if ( !email.value ) {
            /*
            email.blur();
            password.blur();
            Dialog({
                "msg":"请填写用户名！",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onClose":function() {
                    email.focus();
                    return true;
                },
                "onSubmit":function() {
                    email.focus();
                    return true;
                }
            });*/
            email.focus();
            this.loginError("填写您的常用邮箱！");
            return false;
        }
        if ( !chackMail(email.value) ) {
            email.select();
            this.loginError("请填写正确的邮箱！");
            return false;
        }

        if ( !password.value ) {
            /*
            email.blur();
            password.blur();
            Dialog({
                "msg":"请填写密码！",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onClose":function() {
                    password.focus();
                    return true;
                },
                "onSubmit":function() {
                    password.focus();
                    return true;
                }
            });*/
            password.focus();
            this.loginError("填写密码后再登录吧！");
            return false;
        }

        if ( code && !code.value ) {
            code.focus();
            this.loginError("填写验证码后再登录吧！");
            return false;
        }
        
        return true;
    };
    member.loginSubmit = function(form) {
        var param = $(form).serialize(),
            that = this;
        form.submitbutton.value = "稍等...";
        form.submitbutton.disabled = true;

        $.post("/user/login", param, function(data) {
            var data;
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            }

            form.submitbutton.value = "登录";
            form.submitbutton.disabled = false;

            if ( that.loginCallback ) {
                that.loginCallback(data);
            }
        });
    };


    member.reg = function(form, callback) {
        var that = this;
        $(form).submit(function() {
            if ( that.regCheck(form) ) {
                $(".reg-subhead").show();
                $(".reg-error").hide();
                that.regSubmit(form);
            }
            return false;
        });
        this.regCallback = callback;

        form.email.select();
    };
    member.regError = function(str) {
        $(".reg-subhead").hide();
        $(".reg-error").html(str).show();
    };
    member.regCheck = function(form) {
        var email = form.email,
            password = form.password,
            repassword = form.repassword;
        if ( !email.value ) {
            email.focus();
            this.regError("填写您的常用邮箱！");
            return false;
        }
        if ( !chackMail(email.value) ) {
            email.select();
            this.regError("请填写正确的邮箱！");
            return false;
        }

        if ( !password.value ) {
            password.focus();
            this.regError("请填写登录密码！");
            return false;
        }

        if ( password.value.length < 6 ) {
            password.focus();
            this.regError("密码至少为6位！");
            return false;
        }

        if ( !repassword.value ) {
            repassword.focus();
            this.regError("请再次填写密码！");
            return false;
        }

        if ( password.value != repassword.value ) {
            this.regError("两次密码不一致！");
            return false;
        }
        
        return true;
    };
    member.regSubmit = function(form) {
        var param = $(form).serialize(),
            that = this;
        form.submitbutton.value = "稍等...";
        form.submitbutton.disabled = true;

        $.post("/user/register", param, function(data) {
            var data;
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            }

            form.submitbutton.value = "注册";
            form.submitbutton.disabled = false;

            if ( that.regCallback ) {
                that.regCallback(data);
            }
        });
    };


    member.forgotPassword = function(form, callback) {
        var that = this;
        $(form).submit(function() {
            if ( that.forgotPasswordCheck(form) ) {
                $(".forgotPassword-subhead").show();
                $(".forgotPassword-error").hide();
                that.forgotPasswordSubmit(form);
            }
            return false;
        });
        this.forgotPasswordCallback = callback;

        form.email.select();

        if ( error ) {
            Dialog(error);
        }
    };
    member.forgotPasswordError = function(str) {
        $(".forgotPassword-subhead").hide();
        $(".forgotPassword-error").html(str).show();
    };
    member.forgotPasswordCheck = function(form) {
        var email = form.email,
            code = form.code;
        if ( !email.value ) {
            email.focus();
            this.forgotPasswordError("填写您的注册邮箱！");
            return false;
        }
        if ( !chackMail(email.value) ) {
            email.select();
            this.forgotPasswordError("请填写正确的邮箱！");
            return false;
        }
        if ( code && !code.value ) {
            code.focus();
            this.forgotPasswordError("填写验证码后再登录吧！");
            return false;
        }
        return true;
    };
    member.forgotPasswordSubmit = function(form) {
        var param = $(form).serialize(),
            that = this;
        form.submitbutton.value = "稍等...";
        form.submitbutton.disabled = true;

        $.post("/user/forgotPassword", param, function(data) {
            var data;
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            }

            form.submitbutton.value = "提交";
            form.submitbutton.disabled = false;

            if ( that.forgotPasswordCallback ) {
                that.forgotPasswordCallback(data);
            }
        });
    };



    member.resetPassword = function(form, callback) {
        var that = this;
        $(form).submit(function() {
            if ( that.resetPasswordCheck(form) ) {
                $(".resetPassword-subhead").show();
                $(".resetPassword-error").hide();
                that.resetPasswordSubmit(form);
            }
            return false;
        });
        this.resetPasswordCallback = callback;

        form.password.select();
    };
    member.resetPasswordError = function(str) {
        $(".resetPassword-subhead").hide();
        $(".resetPassword-error").html(str).show();
    };
    member.resetPasswordCheck = function(form) {
        var password = form.password,
            repassword = form.repassword;

        if ( !password.value ) {
            password.focus();
            this.resetPasswordError("请填写新密码！");
            return false;
        }

        if ( password.value.length < 6 ) {
            password.focus();
            this.resetPasswordError("新密码至少为6位！");
            return false;
        }

        if ( !repassword.value ) {
            repassword.focus();
            this.resetPasswordError("请再次填写新密码！");
            return false;
        }

        if ( password.value != repassword.value ) {
            this.resetPasswordError("两次密码不一致！");
            return false;
        }
        return true;
    };
    member.resetPasswordSubmit = function(form) {
        var param = $(form).serialize(),
            that = this;
        form.submitbutton.value = "稍等...";
        form.submitbutton.disabled = true;

        $.post("/user/resetPassword/"+form.hash.value, param, function(data) {
            var data;
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            }

            form.submitbutton.value = "提交";
            form.submitbutton.disabled = false;

            if ( that.resetPasswordCallback ) {
                that.resetPasswordCallback(data);
            }
        });
    };





    member.user = function() {
        return {"email":"111@111.com", "nickname":"F7"};
    };

    return member;
});