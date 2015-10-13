/*
  auther:f7
  date:2015.7
*/

requirejs.config({
    paths: {
        jquery: [
            './jquery-1.11.1.min'
        ],
        dialog: './dialog.3.1.min'
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




// 公共方法初始化
require(["jquery", "dialog"], function($, Dialog) {
    openActive();
});


