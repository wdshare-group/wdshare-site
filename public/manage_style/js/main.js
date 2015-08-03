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
    this.reMailSent();
    this.sendInvite();
    this.batchInvite();
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
 * 重新发送报名成功提醒邮件
 * @return
 */
Join.reMailSent = function() {
    $(".js-join-reMailSent").click(function() {
        var params = {
            aid: $(this).attr("data-aid"),
            mail: $(this).attr("data-mail"),
            name: $(this).attr("data-name"),
            aName: $(this).attr("data-active-name"),
            aTime: $(this).attr("data-active-time"),
            aAddress: $(this).attr("data-active-address")
        }
        if( confirm("确定要重新发送报名成功提醒邮件？") ) {
            request(params);
        };
        return false;
    });
    function request(params) {
        $.post("/manage/active/join/remailsent/", params, function( data ) {
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
 * 发送邀请函
 * @return
 */
Join.sendInvite = function() {
    $(".js-join-sendInvite").click(function() {
        var id = $(this).parent().attr("data-id");
        if( confirm("确定要发送邀请函？") ) {
            request(id);
        };
        return false;
    });
    function request(id) {
        Dialog({'id':'sendInvite-loading', 'msg':'<div class="dialog-jion-alert">邀请函发送中...</div>', 'lock':true, 'lockClose':false, title:"发送过程中请勿刷新页面"});
        $.get("/manage/active/invite/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            }
            if ( data.status ) {// 成功
                Dialog.close("sendInvite-loading");
                alert(data.msg);
                window.location.reload();
            } else {
                if ( data.url ) {// 报错情况下需要跳转时进行处理
                    window.location = data.url;
                }
                Dialog.close("sendInvite-loading");
                alert(data.msg);
                return false;
            };
        });
    };
};

/**
 * 群发邀请函
 * @return
 */
Join.batchInvite = function() {
    var join,
        batch = [],
        batchIndex = 0,
        yes = 0,
        no = 0;
    $("#js-join-batchInvite").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("群发期间不可断网、不可刷新页面") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        Dialog({'id':'batchInvite', 'msg':'<div class="dialog-jion-alert" style="max-height:500px; overflow:auto;">开始请求群发列表...</div>', 'lock':true, 'lockClose':false, 'title':'群发操作，耗时较长，请勿刷新页面！', onClose:function(){
            window.location.reload();
        }});
        $.get("/manage/active/batchinvite/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            }

            if ( data.status ) {// 成功
                join = data.data;
                batchSendSelect();
            } else {
                if ( data.url ) {// 报错情况下需要跳转时进行处理
                    window.location = data.url;
                }
                alert(data.msg);
                return false;
            };
        });
    };

    // 设置状态提示文字
    function setStateText(str) {
        var elem = $("#batchInvite .dialog-jion-alert");
        elem.html(elem.html() +"<br />"+ str);
    };

    // 批量发送筛选
    function batchSendSelect() {
        for (var i=0,l=join.length; i<l; i++) {
            if ( join[i].code && join[i].state == 1 ) {
                batch.push(join[i]);
            }
        }
        setStateText("获取到 "+ batch.length +" 条符合群发数据，开始群发：");
        batchSend();
    };

    // 批量发送
    function batchSend() {
        if ( batchIndex == batch.length ) {// 发送完成
            setStateText("完成群发操作，目标："+ batch.length +"条，成功："+ yes +"条，失败：" + no +"条");
            return false;
        }
        
        // 开始逐条请求发送邀请函
        $.ajax({
            "timeout": 20000,// 20秒即超时
            "url": "/manage/active/invite/"+batch[batchIndex]._id,
            "success": function(data) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                }
                if ( data.status ) {// 成功
                    yes++;
                } else {
                    no++;
                };

                batchIndex++;
            },
            "error": function() {
                no++;
                batchIndex++;
            },
            "complete": function() {
                setStateText("已处理 "+ batchIndex +" 条，成功 "+ yes +" 条，失败 "+ no +" 条，继续处理中...");
                batchSend();// 递归式逐条请求
            }
        });
        /*
        $.get("/manage/active/invite/"+batch[batchIndex]._id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            }
            if ( data.status ) {// 成功
                yes++;
            } else {
                no++;
            };

            batchIndex++;
            setStateText("已处理 "+ batchIndex +" 条，成功 "+ yes +" 条，失败 "+ no +" 条，继续处理中...");
            batchSend();// 递归式逐条请求
        });*/
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

