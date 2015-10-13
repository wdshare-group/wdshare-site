define(['jquery', 'dialog'], function($) {
    
    // 子导航当前状态初始化
    function childNavInit() {
        if ( $(".myhome-nav-con").length < 1 ) { return false };
        var url_menus = ["user/editInfo", "user/editPassword/"],
            page_menus = ["修改资料", "修改密码"],
            _lis = $(".myhome-nav-con a"),
            url = window.location.href,
            current;

        for ( var i=0, l=url_menus.length; i<l; i++ ) {
            if ( url.indexOf( url_menus[i] ) >= 0 ) {
                current = i;
                break;
            };
        };

        for ( var i=0, l=_lis.length; i<l; i++ ) {
            if ( _lis[i].innerHTML == page_menus[current] ) {
                _lis[i].className = "current";
            };
        };
    };

    /**
     * 修改密码提交
     */
    function editPasswordSubmit() {
        if ( !document.getElementById("js-edit-password") ) { return false };
        var _form = document.getElementById("js-edit-password");
        $("#js-edit-password").submit(function() {
            if ( !_form.password.value ) {
                Dialog({
                    "msg":"<br />请输入您的旧密码！<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onComplete": function() {
                       _form.password.focus(); 
                    }
                });
                return false;
            }
            if ( !_form.newPassword.value ) {
                Dialog({
                    "msg":"<br />请输入新密码！<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onComplete": function() {
                       _form.newPassword.focus(); 
                    }
                });
                return false;
            }
            if ( !_form.reNewPassword.value ) {
                Dialog({
                    "msg":"<br />请确认新密码！<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onComplete": function() {
                       _form.reNewPassword.focus(); 
                    }
                });
                return false;
            }
            if ( _form.newPassword.value != _form.reNewPassword.value ) {
                Dialog({
                    "msg":"<br />两次密码不一致！<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false
                });
                return false;
            }

            // 提交新密码
            _form.submitbutton.value = "稍等...";
            _form.submitbutton.disabled = true;
            $.post("/user/editPassword", $(_form).serialize(), function(data) {
                var data;

                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                }

                _form.submitbutton.value = "修改";
                _form.submitbutton.disabled = false;

                if ( data.status == 200 && data.code && data.code == 1 ) {// 修改成功
                    Dialog({
                        "msg":"<br />修改成功，请重新登录！<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location = "/user/login";
                        }
                    });
                } else {// 修改失败
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false
                    });
                }
            });
            return false;
        });
        
    };


    var myhome = {};
    myhome.init = function() {
        childNavInit();

        editPasswordSubmit();
    };


    return myhome;
});