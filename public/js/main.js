function chackMail(str) {
    var re = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]*)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    return(re.test(str));
};

// cookie
function setCookie(name, value, expires, path, domain){
    if( expires && isNaN(expires)===false ){expires=new Date(new Date().getTime()+expires)};
    document.cookie=name+"="+escape(value)+((expires)?"; expires="+expires.toGMTString():"")+((path)?"; path="+path:"; path=/")+((domain)?";domain="+domain:"");
};
function getCookie(name) {
    var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
    if(arr!=null){
        return unescape( arr[2] );
    }
    return null;
};

function checkForm(elem) {
    var _mail = elem.mail,
        _name = elem.name,
        _com = elem.com,
        _web = elem.web,
        _content = elem.content,
        _chi = elem.chi,
        _cookie;
    if ( !checkFormMail(_mail) ) {
        _mail.select();
        return false;
    };
    if ( !checkFormName(_name) ) {
        _name.select();
        return false;
    };


    // 第五期面试主题收集技能信息使用
    var skill = '';
    skill += 'HTML/CSS技能：';
    if ( elem.html.value == "0" ) {
        skill += '不认识；';
    } else if ( elem.html.value == "1" ) {
        skill += '了解；';
    } else if ( elem.html.value == "2" ) {
        skill += '熟悉；';
    } else if ( elem.html.value == "3" ) {
        skill += '精通；';
    };

    skill += 'JS技能：';
    if ( elem.js.value == "0" ) {
        skill += '不认识；';
    } else if ( elem.js.value == "1" ) {
        skill += '了解；';
    } else if ( elem.js.value == "2" ) {
        skill += '熟悉；';
    } else if ( elem.js.value == "3" ) {
        skill += '精通；';
    };

    skill += 'NodeJS技能：';
    if ( elem.node.value == "0" ) {
        skill += '不认识；';
    } else if ( elem.node.value == "1" ) {
        skill += '了解；';
    } else if ( elem.node.value == "2" ) {
        skill += '熟悉；';
    } else if ( elem.node.value == "3" ) {
        skill += '精通；';
    };
    if ( elem.other.value ) {
        skill += '其他技能：'+ elem.other.value + "； ";
    };







    // 信息存如cookie，用于下次报名自动填写
    _cookie = '{"mail":"'+ _mail.value +'", "name":"'+ _name.value +'", "com":"'+ _com.value +'", "web":"'+ _web.value +'", "content":"'+ _content.value +'", "chi":"'+ _chi.value +'"}';
    setCookie("userinfor", _cookie, 1000*60*60*24*365);


    // 第五期面试主题收集技能信息添加至内容字段
    _content.value = skill + "留言：" + elem.content_temp.value;



    elem.button.value = "数据提交中...";
    elem.button.disabled = true;
    elem.button.style.backgroundColor = "#999";
    // return false;
};

function checkFormMail(_mail) {
    if ( !_mail.value ) {
        showError(_mail, "请填写邮箱");
        return false;
    } else if ( !chackMail(_mail.value) ) {
        showError(_mail, "请正确填写邮箱");
        return false;
    } else {
        showYes(_mail);
        autoWrite("mail", _mail.value);
        return true;
    }
};

function checkFormName(_name) {
    if ( !_name.value ) {
        showError(_name, "请填写您的姓名");
        return false;
    } else if ( _name.value.length < 2 ) {
        showError(_name, "姓名至少两个字");
        return false;
    } else {
        showYes(_name);
        autoWrite("name", _name.value);
        return true;
    }
};

function showError(elem, str) {
    var _p = elem.parentNode,
        _em = _p.getElementsByTagName("em")[0];
    _em.style.display = "inline";
    _em.innerHTML = str;
};

function showYes(elem) {
    var _p = elem.parentNode,
        _em = _p.getElementsByTagName("em")[0];
    _em.style.display = "none";
};

function autoWrite(inname, str) {
    var elem = document.getElementById("joinform"),
        _mail = elem.mail,
        _name = elem.name,
        _com = elem.com,
        _web = elem.web,
        _content = elem.content,
        _chi = elem.chi,
        _flag,
        _co_val;// cookie中的value
    eval( "var _cookie = " + getCookie("userinfor") );
    // console.log(_cookie);
    if ( !_cookie ) { return false };
    if ( inname == "mail" ) {
        console.log(_name.value, _com.value, _web.value, _content.value);
        _flag = !_name.value && !_com.value && !_web.value && !_content.value;
        _co_val = _cookie.mail;
    } else if ( inname == "name" ) {
        _flag = !_mail.value && !_com.value && !_web.value && !_content.value;
        _co_val = _cookie.name;
    };
    // console.log(_flag === true, _co_val == str);
    if ( _flag === true && _co_val == str ) {
        _mail.value = _cookie.mail;
        _name.value = _cookie.name;
        _com.value = _cookie.com;
        _web.value = _cookie.web;
        _content.value = _cookie.content;
        _chi.value = _cookie.chi;
    };
};


/**
 * 设置导航栏当前效果
 * @return
 */
function resetnav() {
    var elem = document.getElementById("js-nav"),
        _as = elem.getElementsByTagName("a"),
        url = window.location.href,
        flag = 0;

    url = url.substring(0, url.lastIndexOf("/")+1);

    for ( var i=0,l=_as.length; i<l; i++ ) {
        $(_as[i].parentNode).removeClass("current");
        if ( _as[i].href == url ) {
            flag = i;
        };
    }

    $(_as[flag].parentNode).addClass("current");
};
resetnav();
