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






var Active = {};
Active.init = function() {
    this.create();
    this.del();
};

/**
 * 启动创建活动JS
 * @return
 */
Active.create = function() {
    if ( !document.getElementById("js-create-form") ) { return false };
    
    $('#js-create-form').submit(function() {
        if ( !this.aName.value ) {
            alert("活动名称必须填写");
            this.aName.focus();
            return false;
        }
        var formData = $(this).serialize();
        $.ajax({
            method: "POST",
            url: "/manage/active/updateControl/",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                }

                if ( data.status ) {// 成功
                    alert(data.msg);
                    window.location = "/manage/active/";
                } else {
                    if ( data.url ) {// 报错情况下需要跳转时进行处理
                        window.location = data.url;
                    }
                    alert(data.msg);
                    return false;
                };
            }
        });
        return false;
    });
};

/**
 * 删除活动
 * @return
 */
Active.del = function() {
    $(".js-active-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这个活动？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/active/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            }

            if ( data.status ) {// 成功
                alert(data.msg);
                window.location.reload();
            } else {
                if ( data.url ) {// 报错情况下需要跳转时进行处理
                    window.location = data.url;
                }
                alert(data.msg);
                return false;
            };
        });
    };
};



var Join = {};
/**
 * 报名初始化
 * @return
 */
Join.init = function() {
    this.death();
    this.life();
    this.del();
    this.createcode();
};
/**
 * 屏蔽报名
 * @return
 */
Join.death = function() {
    $(".js-join-death").click(function() {
        var id = $(this).parent().attr("data-id");
        if( confirm("确定要屏蔽这个报名？") ) {
            request(id);
        };
        return false;
    });
    function request(id) {
        $.get("/manage/active/join/death/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            }
            if ( data.status ) {// 成功
                // alert(data.msg);
                window.location.reload();
            } else {
                if ( data.url ) {// 报错情况下需要跳转时进行处理
                    window.location = data.url;
                }
                alert(data.msg);
                return false;
            };
        });
    };
};
/**
 * 开启被屏蔽的报名
 * @return
 */
Join.life = function() {
    $(".js-join-life").click(function() {
        var id = $(this).parent().attr("data-id");
        if( confirm("确定要开启这个报名？") ) {
            request(id);
        };
        return false;
    });
    function request(id) {
        $.get("/manage/active/join/life/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            }
            if ( data.status ) {// 成功
                // alert(data.msg);
                window.location.reload();
            } else {
                if ( data.url ) {// 报错情况下需要跳转时进行处理
                    window.location = data.url;
                }
                alert(data.msg);
                return false;
            };
        });
    };
};
/**
 * 删除报名
 * @return
 */
Join.del = function() {
    $(".js-join-del").click(function() {
        var id = $(this).parent().attr("data-id");
        if( confirm("确定要删除这个报名？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/active/join/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            }

            if ( data.status ) {// 成功
                alert(data.msg);
                window.location.reload();
            } else {
                if ( data.url ) {// 报错情况下需要跳转时进行处理
                    window.location = data.url;
                }
                alert(data.msg);
                return false;
            };
        });
    };
};
/**
 * 生成code
 * @return
 */
Join.createcode = function() {
    $("#js-join-createcode").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要生成所有Code？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/active/join/createcode/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            }

            if ( data.status ) {// 成功
                alert(data.msg);
                window.location.reload();
            } else {
                if ( data.url ) {// 报错情况下需要跳转时进行处理
                    window.location = data.url;
                }
                alert(data.msg);
                return false;
            };
        });
    };
};

/**
 * 启动
 * @return
 */
function domready() {
    Active.init();
    Join.init();
};



require(["jquery", "dialog"], function($, Dialog) {
    domready();
});

