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
        autosize: './autosize.min'// textarea自动调整大小
    },
    shim: {
    }
});


/**
 * =============  公共方法  =============
 */


/**
 * 获取URL参数『支持 ? 和 # 』
 * @param  {String} name 参数名称
 * @return {String}      返回参数值
 */
function getUrlParam( name ) {
    var reg = new RegExp("(^|\\#|\\?|&)"+ name +"=([^&]*)(\\s|&|$)", "i");  
    if (reg.test(location.href)) return unescape(RegExp.$2.replace(/\+/g, " ")); return "";
};

// cookie
var setCookie = function(name, value, expires, path, domain){
    if( expires && isNaN(expires)===false ){expires=new Date(new Date().getTime()+expires)};
    document.cookie=name+"="+escape(value)+((expires)?"; expires="+expires.toGMTString():"")+((path)?"; path="+path:"; path=/")+((domain)?";domain="+domain:"");
};
var getCookie = function(name){
    var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
    if(arr!=null){
        return unescape( arr[2] );
    }
    return null;
};
var clearCookie = function(name, path, domain){
    if(getCookie(name)){
        document.cookie=name+"="+((path)?"; path="+path:"; path=/")+((domain)?"; domain="+domain:"")+";expires=Fri, 02-Jan-1970 00:00:00 GMT";
    }
};


/**
 * 开启中的活动【写在Head上的红标】
 * @return
 */
function openActive() {
    var elem = $("#js-openActive-count");
    $.get("/active/open", function(data) {
        var cookieActiveid = getCookie("WDS_newActiveLook"),
            count = 0;

        if ( !data ) { return false };
        if ( typeof data == "string" ) {
            data = $.parseJSON(data);
        }

        if ( data.status ) {// 成功
            if ( !cookieActiveid ) {
                if ( data.count > 0 ) {
                    elem.html(data.count).show();
                }
                return false;
            }
            
            // 对比cookie中存储的ID
            if ( data.data.length > 0 ) {
                $(data.data).each(function() {
                    if ( cookieActiveid.indexOf(this) < 0 ) {
                        count++;
                    }
                });
            }
            if ( count > 0 ) {
                elem.html(count).show();
            }
        };
    });
};


/**
 * 侧栏效果初始化
 * @return
 */
function pageSide() {
    // 初始化DOM元素
    if ( !document.getElementById("js-side") ) {
        var _div = document.createElement("div"),
            _html = '';
        _div.id = "js-side";
        _div.className = "wds-side";

        _html += '<div class="wds-side-con maxWidth">';
        _html += '  <div class="wds-side-link">';
        _html += '    <a href="#" class="wds-side-feedback" id="js-side-feedback" title="报错、建议"></a>';
        _html += '    <a href="#" class="wds-side-gotop" id="js-side-gotop" title="返回顶部"></a>';
        _html += '  </div>';
        _html += '</div>';

        _div.innerHTML = _html;
        document.getElementsByTagName("body")[0].appendChild(_div);
    }

    // 侧栏居顶隐藏
    $(window).on("scroll", function() {
        sideShow();
    });
    sideShow();
    
    function sideShow() {
        var _c = $(window).scrollTop();
        if ( _c > 200 && !$("#js-side").hasClass("wds-side-show") ) {
            $("#js-side").addClass("wds-side-show");
        } else if ( _c < 200 ) {
            $("#js-side").removeClass("wds-side-show");
        }
    };

    // 返回顶部初始化
    $("#js-side").click(function() {
        $(window).scrollTop(0);
        return false;
    });

    sideFeedback();
};

/**
 * 侧栏意见反馈
 * @return
 */
function sideFeedback() {
    var _html = '',
        notLoginHtml = '',
        loginurl = '/user/login?referer='+window.location.href,
        regurl = '/user/register?referer='+window.location.href;
    _html += '<form id="side-feedback-form" name="side-feedback" method="post" action="">';
    _html += '<input type="hidden" name="typeid" value="5629d991f1fdbf3819995e7f">';
    _html += '<input type="hidden" name="model" value="article">';
    _html += '<input type="hidden" name="title" value="向管理员反馈">';
    _html += '<input type="hidden" name="privacy" value="0">';
    _html += '<input type="hidden" name="content">';
    _html += '<div class="side-feedback-box">';
    _html += '<dl><dt>类型：</dt><dd><select name="channel"><option value="报错" selected>报错</option><option value="意见反馈">意见反馈</option></select></dd></dl>';
    _html += '<dl><dt>内容：</dt><dd><textarea name="msg" placeholder="请输入内容" ></textarea></dd></dl>';
    _html += '</div>';
    _html += '</form>';

    notLoginHtml += '<div class="dialog-not-login"><a href="'+loginurl+'">登录</a>后才可以提交内容，没有帐号请先<a href="'+regurl+'">注册</a>。</div>';

    $("#js-side-feedback").click(function() {
        if ( user ) {
            new Dialog({
                'id': 'js-dialog-side-feedback',
                'msg': _html,
                'lock': true,
                'animation': 'animated bounceInRight',
                'title': '报错及意见反馈',
                'lockClose': false,
                'showButtons': true,
                'submitButton': '提交',
                'onReady': function() {
                    $("#side-feedback-form").submit(function () {
                        sideFeedbackSubmit(this);
                        return false;
                    });
                },
                'onSubmit': function() {
                    sideFeedbackSubmit($("#side-feedback-form")[0]);
                    return false;
                }
            });
        } else {
            new Dialog({
                'msg': notLoginHtml,
                'lock': true,
                'animation': 'animated bounceInRight',
                'title': '报错及意见反馈',
                'lockClose': false,
                'showButtons': true,
                'submitButton': '登录',
                'cancelButton': '注册',
                'onSubmit': function() {
                    window.location = loginurl;
                },
                'onCancel': function() {
                    window.location = regurl;
                }
            });
        }
        return false;
    });
    
    // function 
    
    /**
     * 提交报错建议
     * @param  {HTMLElement} _form form表单
     * @return
     */
    function sideFeedbackSubmit(_form) {
        if ( !_form.msg.value ) {
            alert("请填写内容后再提交");
            _form.msg.focus();
            return false;
        }
        if ( _form.msg.value.length > 500 ) {
            alert("内容太多了，请缩减一些。");
            _form.msg.focus();
            return false;
        }
        _form.content.value = _form.channel.value +"："+ _form.msg.value + " 【来自网页："+ window.location.href +"】";
        // console.log(_form.content.value);
        // console.log($(_form).serialize());

        var formData = $(_form).serialize();
        $("#js-dialog-side-feedback .D_submit").val("稍等...").attr("disabled", true);

        $.ajax({
            method: "POST",
            url: "/comment/add",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $("#js-dialog-side-feedback .D_submit").val("提交").attr("disabled", false);

                if ( data.reload && !document.getElementById("side-feedback-code") ) {
                    $("#js-dialog-side-feedback .side-feedback-box").append('<dl class="side-feedback-code"><dt>验证码：</dt><dd><input type="text" name="code" placeholder="验证码" /> <img id="side-feedback-code" src="/captcha/get?'+new Date().getTime()+'" onclick="this.src +=\'?\'+new Date().getTime(); return false;" title="点击刷新验证码" /></dd></dl>');
                    $("#side-feedback-form input[name=code]").focus();
                    return false;
                }

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />已提交，感谢您的贡献！<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onReady": function() {
                            $(".D_submit").focus();
                        }
                    });
                    Dialog.close("js-dialog-side-feedback");
                } else {// 失败
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onReady": function() {
                            $(".D_submit").focus();
                        },
                        "onComplete": function() {
                            if ( data.url ) {
                                window.location = data.url;
                                return false;
                            }
                            // 更新验证码
                            $("#side-feedback-code").attr("src", $("#side-feedback-code").attr("src")+'?'+new Date().getTime());
                        }
                    });
                }
            }
        });
    };
};







// JS Routes
/**
 * 活动报名JS初始化
 * @return
 */
if ( document.getElementById("js-active-join") ) {
    require(["activeJoin"], function(activeJoin) {
        activeJoin.init();
    });
};

/**
 * 修改信息JS初始化
 * @return
 */
if ( document.getElementById("js-edit-form") ) {
    require(["editInfo"], function(editInfo){
        editInfo.init();
    });
}

/**
 * 所有passport相关JS初始化
 * @return
 */
if ( document.getElementById("js-passport") ) {
    require(["passport"], function(passport){
        passport.init();
    });
}

/**
 * 所有个人主页相关JS初始化
 * @return
 */
if ( document.getElementById("js-myhome") ) {
    require(["myhome"], function(myhome){
        myhome.init();
    });
}



/**
 * 文章终极页
 * @return
 */
if ( document.getElementById("article-detail") ) {
    require(["article"], function(article){
        article.init();
    });    
}


/**
 * 添加文章
 * @return
 */
if ( document.getElementById("js-article-create-form") ) {
    require(["addArticle"], function(addArticle){
        addArticle.init();
    });
}


/**
 * 评论
 * @return
 */
if ( document.getElementById("js-comment") ) {
    require(["comment"], function(comment){
        comment.init();
    });
}


// 公共方法初始化
require(["jquery", "dialog"], function($, Dialog) {
    openActive();
    pageSide();
});


