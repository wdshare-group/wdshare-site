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
});

