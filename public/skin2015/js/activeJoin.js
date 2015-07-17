define(["jquery"], function(){
    
    function chackMail(str) {
        var re = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]*)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        return (re.test(str));
    };


    function showError(elem, str) {
        var _p = elem.parentNode,
            _em = _p.getElementsByTagName("em")[0];
        _em.style.display = "inline";
        _em.innerHTML = str;
        // elem.select();
    };

    function showYes(elem) {
        var _p = elem.parentNode,
            _em = _p.getElementsByTagName("em")[0];
        _em.style.display = "none";
    };



    var Active = {};

    /**
     * 活动报名相关初始化
     * @return
     */
    Active.init = function() {
        if ( !document.getElementById("js-active-join") ) { return false };
        this.addEvent();
    };

    Active.addEvent = function() {
        // 对接外部表单检测
        var cheakForm = this.activeCheckForm;
        // 对外接口：外部表单检测优先处理
        if ( typeof APIActiveFormCheck == "function" ) {
            cheakForm = APIActiveFormCheck;
        }


        $("#js-joinform").submit(function() {
            if ( cheakForm() ) {
                Active.joinRequest();
            };
            return false;
        });


        // 注册表单失去焦点事件
        var _form = $("#js-joinform"),
            mail = _form.find("input[name='mail']"),
            name = _form.find("input[name='name']");
        mail.blur(function() {
            Active.checkFormMail(this);
        });
        name.blur(function() {
            Active.checkFormName(this);
        });

    };

    /**
     * 报名表单检测【外部页面存在APIActiveFormCheck方法时改方法无效】
     * @return {Boolean} 代表是否允许继续提交表单
     */
    Active.activeCheckForm = function() {
        var _form = $("#js-joinform"),
            mail = _form.find("input[name='mail']"),
            name = _form.find("input[name='name']");
        if ( !Active.checkFormMail(mail[0]) ||  !Active.checkFormName(name[0]) ) {
            return false;
        };
        return true;
    };

    /**
     * 检测表单邮箱
     * @return {[type]} [description]
     */
    Active.checkFormMail = function(mail) {
        if ( !chackMail($(mail).val()) ) {
            showError(mail, "请正确填写邮箱");
            return false;
        } else {
            showYes(mail);
        };
        return true;
    };
    /**
     * 检测表单姓名
     * @return {[type]} [description]
     */
    Active.checkFormName = function(name) {
        if ( !name.value ) {
            showError(name, "请填写您的姓名");
            return false;
        } else if ( name.value.length < 2 ) {
            showError(name, "姓名至少两个字");
            return false;
        } else {
            showYes(name);
        }
        return true;
    };



    /**
     * 报名表单检测【外部页面存在APIActiveFormParam方法时改方法无效】
     * @return {Boolean} 代表是否允许继续提交表单
     */
    Active.activeFormParam = function() {
        var formParam = {},
            _form = document.getElementById("js-joinform"),
            guestbook = _form.guestbook.value,
            share = _form.w_share.value,
            share_text;

        formParam.aid = _form.aid.value;
        formParam.mail = _form.mail.value;
        formParam.name = _form.name.value;
        formParam.com = _form.com.value;
        formParam.web = _form.web.value;
        formParam.chi = _form.chi.value;

        if (share == "1") {
            share_text = "分享师：YES";
        } else {
            share_text = "分享师：NO";
        }
        formParam.content = share_text + "；留言：" + guestbook;

        return formParam;
    };
    /**
     * 发起加入请求
     * @return
     */
    Active.joinRequest = function() {
        var url = "/active/join/";

        // 对接外部表单参数
        var formParam = this.activeFormParam;
        // 对外接口：外部表单接口优先处理
        if ( typeof APIActiveFormParam == "function" ) {
            formParam = APIActiveFormParam;
        }

        // 让表单无法提交
        var _submit = $("#js-joinform input[type='submit']")[0];
        $(_submit).val("数据提交中...");
        _submit.disabled = true;

        $.post(url, formParam(), function(result) {
            var text;
            if ( !result ) { return false };
            if ( typeof result == "string" ) {
                var data = $.parseJSON(result);
            } else {
                var data = result;
            }

            if ( data.repeat ) {
                text = "您已报名，无需重复报名！";
            } else {
                text = "恭喜您，报名成功！";
            }

            // 提示成功
            Dialog({'msg':'<div class="dialog-jion-alert">'+ text +'<br />复制网址邀请您的朋友一起参与本次活动。</div>', 'lock':true, 'title':'活动报名', 'animation':'animated bounceIn', onClose:function() {
                window.location.reload();
            }});
            // 恢复提交状态
            _submit.disabled = false;
            $(_submit).val("提交报名");
        });

        return false;
    };




    return Active;
});