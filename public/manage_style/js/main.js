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
        moment: '/static/plugin/moment/moment.min',
        datepicker: '/static/plugin/datepicker/js/bootstrap-datepicker',
        // markdown相关
        marked          : "../../plugin/editor.md/lib/marked.min",
        prettify        : "../../plugin/editor.md/lib/prettify.min",
        raphael         : "../../plugin/editor.md/lib/raphael.min",
        underscore      : "../../plugin/editor.md/lib/underscore.min",
        flowchart       : "../../plugin/editor.md/lib/flowchart.min", 
        jqueryflowchart : "../../plugin/editor.md/lib/jquery.flowchart.min", 
        sequenceDiagram : "../../plugin/editor.md/lib/sequence-diagram.min",
        katex           : "../../plugin/editor.md/lib/katex.min",
        editormd        : "../../plugin/editor.md/editormd.amd" // Using Editor.md amd version for Require.js
    },
    shim: {
        datepicker: ['jquery'],
        moment: ['jquery'],
        jqueryflowchart: ["jquery"],
        editormd: ["jquery"]
    },
    waitSeconds: 60
});

// markdown依赖
var deps = [
    "editormd", 
    // "../../plugin/editor.md/languages/en", 
    "../../plugin/editor.md/plugins/link-dialog/link-dialog",
    "../../plugin/editor.md/plugins/reference-link-dialog/reference-link-dialog",
    "../../plugin/editor.md/plugins/image-dialog/image-dialog",
    "../../plugin/editor.md/plugins/code-block-dialog/code-block-dialog",
    "../../plugin/editor.md/plugins/table-dialog/table-dialog",
    "../../plugin/editor.md/plugins/emoji-dialog/emoji-dialog",
    "../../plugin/editor.md/plugins/goto-line-dialog/goto-line-dialog",
    "../../plugin/editor.md/plugins/help-dialog/help-dialog",
    "../../plugin/editor.md/plugins/html-entities-dialog/html-entities-dialog", 
    "../../plugin/editor.md/plugins/preformatted-text-dialog/preformatted-text-dialog"
];
// markdown显示以来
var depsShow = ["editormd"];

/**
 * =============  公共方法  =============
 */
function chackMail(str) {
    var re = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]*)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    return (re.test(str));
};





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
        if ( !this.aClass.value ) {
            alert("请选择活动分类");
            this.aClass.focus();
            return false;
        }
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
 * 单页面管理
 * @return
 */
var ArticleCrumbs = {};
ArticleCrumbs.init = function() {
    this.create();
    this.del();
};

/**
 * 创建单页面
 * @return
 */
ArticleCrumbs.create = function() {
    if ( !document.getElementById("js-articleCrumbs-create-form") ) { return false };
    
    $('#js-articleCrumbs-create-form').submit(function() {
        var _form = this;
        if ( !_form.title.value ) {
            alert("页面标题必须填写！");
            _form.title.focus();
            return false;
        }
        
        if ( _form.aid == undefined && !_form.url.value ) {
            alert("URL标识必须填写！");
            _form.url.focus();
            return false;
        }
        if ( !_form.content.value ) {
            alert("内容必须填写！");
            _form.content.focus();
            return false;
        }

        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/articleCrumbs/create",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location = "/manage/articleCrumbs";
                        }
                    });
                } else {// 失败
                    alert(data.message);
                }
            }
        });
        return false;
    });
};

/**
 * 删除单页面
 * @return
 */
ArticleCrumbs.del = function() {
    $(".js-articleCrumbs-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这个单页面？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/articleCrumbs/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function(that) {
                        $(that.content).find(".D_submit").focus();
                    },
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};



/**
 * 文章分类管理
 * @return
 */
var ArticleChannels = {};
ArticleChannels.init = function() {
    this.create();
    this.del();
};

/**
 * 创建文章分类
 * @return
 */
ArticleChannels.create = function() {
    if ( !document.getElementById("js-articleChannels-create-form") ) { return false };
    
    $('#js-articleChannels-create-form').submit(function() {
        var _form = this;
        if ( !_form.name.value ) {
            alert("分类名称必须填写！");
            _form.name.focus();
            return false;
        }
        
        if ( _form.aid == undefined && !_form.url.value ) {
            alert("URL标识必须填写！");
            _form.url.focus();
            return false;
        }

        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/article/channel/create",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location = "/manage/article/channel";
                        }
                    });
                } else {// 失败
                    alert(data.message);
                }
            }
        });
        return false;
    });
};

/**
 * 删除文章分类
 * @return
 */
ArticleChannels.del = function() {
    $(".js-articleChannels-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这个分类？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/article/channel/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function(that) {
                        $(that.content).find(".D_submit").focus();
                    },
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};


/**
 * 活动分类管理
 * @return
 */
var ActiveChannels = {};
ActiveChannels.init = function() {
    this.create();
    this.del();
};

/**
 * 创建活动分类
 * @return
 */
ActiveChannels.create = function() {
    if ( !document.getElementById("js-activeChannels-create-form") ) { return false };
    
    $('#js-activeChannels-create-form').submit(function() {
        var _form = this;
        if ( !_form.name.value ) {
            alert("分类名称必须填写！");
            _form.name.focus();
            return false;
        }
        
        if ( _form.aid == undefined && !_form.url.value ) {
            alert("URL标识必须填写！");
            _form.url.focus();
            return false;
        }

        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/active/channel/create",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location = "/manage/active/channel";
                        }
                    });
                } else {// 失败
                    alert(data.message);
                }
            }
        });
        return false;
    });
};

/**
 * 删除活动分类
 * @return
 */
ActiveChannels.del = function() {
    $(".js-activeChannels-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这个分类？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/active/channel/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function(that) {
                        $(that.content).find(".D_submit").focus();
                    },
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};




/**
 * 标签管理
 * @return
 */
var Tags = {};
Tags.init = function() {
    this.create();
    this.del();
};

/**
 * 创建标签
 * @return
 */
Tags.create = function() {
    if ( !document.getElementById("js-tags-create-form") ) { return false };
    
    $('#js-tags-create-form').submit(function() {
        var _form = this;
        if ( !_form.name.value ) {
            alert("标签名称必须填写！");
            _form.name.focus();
            return false;
        }

        if ( !_form.model.value ) {
            alert("标签类型必须选择！");
            _form.model.focus();
            return false;
        }
        
        if ( !_form.level.value ) {
            alert("标签权重必须填写！");
            _form.level.focus();
            return false;
        }

        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/tag/create",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location = "/manage/tags";
                        }
                    });
                } else {// 失败
                    alert(data.message);
                }
            }
        });
        return false;
    });
};

/**
 * 删除标签
 * @return
 */
Tags.del = function() {
    $(".js-tag-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这个标签？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/tag/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function(that) {
                        $(that.content).find(".D_submit").focus();
                    },
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};




/**
 * 捐赠管理
 * @return
 */
var Donation = {};
Donation.init = function() {
    this.create();
    this.del();
    this.setDate();
};

/**
 * 设置捐赠时间
 * @return
 */
Donation.setDate = function() {
    if ( !document.getElementById("js-donation-create-form") ) { return false };
    var elem = $('#js-donation-create-form input[name="addDate"]'),
        now = new Date();

    if ( !elem.val() ) {
        elem.val(moment().format("YYYY-MM-DD"));
    }
};

/**
 * 创建捐赠
 * @return
 */
Donation.create = function() {
    if ( !document.getElementById("js-donation-create-form") ) { return false };
    
    $('#js-donation-create-form').submit(function() {
        var _form = this;
        if ( !_form.channel.value ) {
            alert("请选择捐赠分类！");
            _form.channel.focus();
            return false;
        }

        if ( !_form.name.value ) {
            alert("捐赠姓名必须填写！");
            _form.name.focus();
            return false;
        }
        
        if ( !_form.gold.value ) {
            alert("捐赠金额必须填写！");
            _form.gold.focus();
            return false;
        }
        if ( isNaN(_form.gold.value) ) {
            alert("金额必须为数字！");
            _form.gold.focus();
            return false;
        }

        if ( !_form.addDate.value ) {
            alert("捐赠时间必须填写！");
            _form.addDate.focus();
            return false;
        }

        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/donation/create",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location = "/manage/donation";
                        }
                    });
                } else {// 失败
                    alert(data.message);
                }
            }
        });
        return false;
    });
};

/**
 * 删除捐赠
 * @return
 */
Donation.del = function() {
    $(".js-donation-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这条捐赠？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/donation/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function(that) {
                        $(that.content).find(".D_submit").focus();
                    },
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};






/**
 * 管理员
 * @return
 */
var ManageUser = {};
ManageUser.init = function() {
    this.create();
    this.del();
};

/**
 * 创建管理员
 * @return
 */
ManageUser.create = function() {
    if ( !document.getElementById("js-manageuser-create-form") ) { return false };
    
    $('#js-manageuser-create-form').submit(function() {
        var _form = this;
        if ( !_form.username.value ) {
            alert("用户名必须填写！");
            _form.username.focus();
            return false;
        }
        
        if ( _form.mid == undefined && !_form.password.value ) {
            alert("密码必须填写！");
            _form.password.focus();
            return false;
        }

        if ( _form.lock.value === "1" && !_form.lockMessage.value ) {
            alert("锁定原因必须填写！");
            _form.lockMessage.focus();
            return false;
        }

        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/addManage",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location = "/manage/manageUsers";
                        }
                    });
                } else {// 失败
                    alert(data.message);
                }
            }
        });
        return false;
    });
};

/**
 * 删除管理员
 * @return
 */
ManageUser.del = function() {
    $(".js-manageUsers-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这个管理员？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/delManage/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function(that) {
                        $(that.content).find(".D_submit").focus();
                    },
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};

/**
 * 管理员登录
 * @return
 */
function manageLogin() {
    if ( !document.getElementById("js-manageLoginForm") ) { return false };
    
    $('#js-manageLoginForm').submit(function() {
        var _form = this;
        if ( !_form.username.value ) {
            alert("用户名必须填写！");
            _form.username.focus();
            return false;
        }
        
        if ( !_form.password.value ) {
            alert("密码必须填写！");
            _form.password.focus();
            return false;
        }
        if ( _form.code && !_form.code.value ) {
            _form.code.focus();
            alert("填写验证码后再登录吧！");
            return false;
        }

        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/login",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("登录").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    window.location = "/manage";
                } else {// 失败
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onReady": function() {
                            $(".D_submit").focus();
                        },
                        "onComplete":function() {
                            // 更新验证码
                            $("#code").attr("src", $("#code").attr("src")+'?'+new Date().getTime());
                            if ( data.reload ) {
                                window.location.reload();
                            }
                        }
                    });
                }
            }
        });
        return false;
    });
};




// 管理导航当前状态初始化
function manageMenuInit() {
    if ( $(".manage-module-link").length < 1 ) { return false };
    var url_menus = ["/manage/active", "/manage/article"],
        page_menus = ["活动管理", "文章管理"],
        _lis = $(".manage-module-link dt"),
        url = window.location.href,
        current;

    for ( var i=0, l=url_menus.length; i<l; i++ ) {
        if ( url.indexOf( url_menus[i] ) >= 0 ) {
            current = i;
            break;
        };
    };

    for ( var i=0, l=_lis.length; i<l; i++ ) {
        if ( $(_lis[i]).find("em").html() == page_menus[current] ) {
            $(_lis[i]).parent().addClass("current");
        };
    };
};






/**
 * 文章管理相关
 * @type {Object}
 */
var Article = {};
Article.init = function() {
    var that = this;
    $("#js-linkType").change(function() {
        that.setLinkUrl();
    });
    this.setLinkUrl();

    this.create();
    this.del();
    this.audit();
    this.noaudit();

    // 初始化标签选择效果
    if ( document.getElementById("js-article-create-form") ) {
        Manage_tags.init();
    }
};
/**
 * 设置跳转链接显示状态
 */
Article.setLinkUrl = function() {
    if ( !document.getElementById("js-linkType") ) { return false };
    var elem = $("#js-linkType")[0];
    if ( elem.checked ) {
        $("#js-linkUrl-box").show();
    } else {
        $("#js-linkUrl-box").hide();
    }
};
/**
 * 创建文章
 * @return
 */
Article.create = function() {
    if ( !document.getElementById("js-article-create-form") ) { return false };

    $('#js-article-create-form').submit(function() {
        var _form = this;
        var linkUrl = _form.linkUrl.value;
        linkUrl = linkUrl.replace("https://", "");
        linkUrl = linkUrl.replace("http://", "");
        // 先看添加标签的表单有没有内容，有内容则代表添加标签
        if ( $("#js-newtag").val() ) {
            // 检测是否超限制
            if ( Manage_tags.checkMax() ) {
                alert("最多添加"+Manage_tags.tagMax+"个标签");
                $("#js-newtag").val("");
                return false;
            }
            if ( $("#js-newtag").val().length > 15 ) {
                alert("单个标签最大15个字");
                return false;
            }
            if ( Manage_tags.checkRepeat($("#js-newtag").val()) ) {
                alert("标签重复！");
                return false;
            }
            // 添加显示之前先检测是否要清空内容
            if ( $("#js-content-tegs-show a").length < 1 ) {
                $("#js-content-tegs-show").html('');
            }
            $("#js-content-tegs-show").append('<a href="#">'+ $("#js-newtag").val() +'<em class="font-icon-del"></em></a>');
            $("#js-newtag").val("");
            Manage_tags.resetValue();
            return false;
        }

        if ( !_form.title.value ) {
            alert("页面标题必须填写！");
            _form.title.focus();
            return false;
        }
        
        if ( !_form.channelId.value ) {
            alert("归属栏目必须选择");
            _form.channelId.focus();
            return false;
        }

        // markdown时向内容表单赋值
        if (typeof mdEditor == "object") {
            _form.content.value = mdEditor.getMarkdown();
        }

        if ( !linkUrl && !_form.content.value ) {
            alert("内容必须填写！");
            _form.content.focus();
            if (typeof mdEditor == "object") {
                $(document).scrollTop($('#wds-editormd').offset().top)
                mdEditor.config("tocDropdown", false);
            }
            return false;
        }

        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/article/create",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location = "/manage/article";
                        }
                    });
                } else {// 失败
                    alert(data.message);
                }
            }
        });
        return false;
    });

    // 初始化Markdown编辑器
    markdownInit();

    // 切换编辑器时进行刷新
    $("#addArticle-changeEditor").change(function() {
        var url = window.location.href;
        if ( url.indexOf("?") > -1 ) {
            url = url.substring(0, url.indexOf("?"));
        }
        window.location = url + "?editorModel=" + this.value;
    });
};
// 初始化Markdown编辑器
var mdEditor;
function markdownInit() {
    if ( document.getElementById("wds-editormd") ) {

        require(deps, function(editormd) {

            mdEditor = editormd("wds-editormd", {
                width: "90%",
                height: 640,
                path : '/static/plugin/editor.md/lib/',
                markdown : $("#js-article-create-form")[0].content.value,
                codeFold : true,
                toolbarIcons : function() {
                    // 使用 "||" 设置菜单右对齐
                    return ["bold", "italic", "quote", "|", "h2", "h3", "h4", "|", "link", "image", "code", "code-block", "table", "|", "undo", "redo", "||", "watch", "fullscreen", "preview", "help"]
                },
                searchReplace : true,
                saveHTMLToTextarea : true,                // 保存HTML到Textarea
                htmlDecode : "style,script,iframe|on*",       // 开启HTML标签解析，为了安全性，默认不开启    
                emoji : true,
                taskList : true,
                tex : true,
                tocm            : true,         // Using [TOCM]
                autoLoadModules : false,
                previewCodeHighlight : true,
                flowChart : true,
                sequenceDiagram : true,
                //dialogLockScreen : false,   // 设置弹出层对话框不锁屏，全局通用，默认为true
                //dialogShowMask : false,     // 设置弹出层对话框显示透明遮罩层，全局通用，默认为true
                //dialogDraggable : false,    // 设置弹出层对话框不可拖动，全局通用，默认为true
                //dialogMaskOpacity : 0.4,    // 设置透明遮罩层的透明度，全局通用，默认值为0.1
                //dialogMaskBgColor : "#000", // 设置透明遮罩层的背景颜色，全局通用，默认为#fff
                imageUpload : true,
                imageFormats : ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
                imageUploadURL : "/user/mdupload",
                onload : function() {
                    $(".markdownLoading").remove();
                    //this.fullscreen();
                    //this.unwatch();
                    //this.watch().fullscreen();

                    //this.setMarkdown("#PHP");
                    //this.width("100%");
                    //this.height(480);
                    //this.resize("100%", 640);
                }
            });
        });

    }
};

/**
 * 删除文章
 * @return
 */
Article.del = function() {
    $(".js-article-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这篇文章？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/article/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function(that) {
                        $(that.content).find(".D_submit").focus();
                    },
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};
/**
 * 审核文章
 * @return
 */
Article.audit = function() {
    $(".js-article-audit").click(function() {
        var id = $(this).attr("data-id"),
            title = $(this).attr("data-title"),
            name = $(this).attr("data-name"),
            mail = $(this).attr("data-mail");

        if( confirm("确定要通过审核？") ) {
            request(id, name, mail, title);
        };
        return false;
    });

    function request(id, name, mail, title) {
        var params = {
            id: id,
            mail: mail,
            title: title,
            name: name
        };
        $.post("/manage/article/audit", params, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};
/**
 * 驳回审核
 * @return
 */
Article.noaudit = function() {
    $(".js-article-noaudit").click(function() {
        var id = $(this).attr("data-id"),
            title = $(this).attr("data-title"),
            name = $(this).attr("data-name"),
            mail = $(this).attr("data-mail");
        Dialog({
            "id":"js-article-noaudit-msg",
            "msg":'驳回《'+ title +'》的审核：<br /><br /><textarea name="noaudit-msg" style="width:300px; height:100px; border:1px solid #ccc; line-height:24px; padding:5px; background:#f2f2f2;"></textarea>',
            "lock":true,
            "lockClose":false,
            "title":"请输入驳回理由",
            "showButtons":true,
            "cancelButton":false,
            "onReady": function() {
                var _text = $("#js-article-noaudit-msg textarea");
                _text[0].focus();
            },
            "onSubmit": function() {
                var _text = $("#js-article-noaudit-msg textarea");
                if ( !_text.val() ) {
                    alert("输入驳回理由后再提交！");
                    _text[0].focus();
                    return false;
                }
                request(id, name, mail, title, _text.val());
            }
        });
        return false;
    });

    function request(id, name, mail, title, msg) {
        var params = {
            id: id,
            mail: mail,
            title: title,
            msg: msg,
            name: name
        };
        $.post("/manage/article/noaudit", params, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};



/**
 * 标签选择效果
 * @return
 */
var Manage_tags = {};
Manage_tags.tagMax = 6;
Manage_tags.init = function() {
    this.addEvent();
    this.showSelected();
    this.getTags();
};
// 现实已经选择的标签内容
Manage_tags.showSelected = function() {
    var _in = $("#js-hidden-tag").val(),
        items,
        _html = ''; 
    if ( !_in ) {
        $("#js-content-tegs-show").html('<p>请选择下方的标签或添加新的</p>');
    } else {
        items = _in.split(",");
        $(items).each(function() {
            if ( !this ) { return false };
            _html += '<a href="#">'+ this +'<em class="font-icon-del"></em></a>';
        });
        $("#js-content-tegs-show").html(_html);
    }
};
Manage_tags.getTags = function() {
    var page = $("#js-content-tegs-list").attr("data-page") || 0,
        pagesize = 10;
    page++;
    if ( $("#js-content-tegs-list").attr("data-sum") && page > Math.ceil($("#js-content-tegs-list").attr("data-sum")/pagesize) ) {
        page = 1;
    }
    $.get("/tags/getaddtagslist?model=article&page="+page+"&pagesize="+pagesize+"&tags="+$("#js-hidden-tag").val(), function(data) {
        if ( !data ) { return false };
        if ( typeof data == "string" ) {
            data = $.parseJSON(data);
        } else {
            data = data;
        };

        // 数据请求失败
        if ( data.code != 1 ) {
            $(".content-tegs-list").hide();
            return false;
        }

        // 没有任何标签，隐藏列表内容
        if ( data.result.length < 1 && $("#js-content-tegs-list a").length < 1 ) {
            $(".content-tegs-list").hide();
            return false;
        }

        // 初始化列表内容
        $("#js-content-tegs-list").attr("data-page", data.pages.page);
        $("#js-content-tegs-list").attr("data-sum", data.pages.sum);
        var _html = '';
        $(data.result).each(function() {
            _html += '<a href="#"><em class="font-icon-add"></em>'+this+'</a>';
        });
        $("#js-content-tegs-list").html(_html);

    });
};
Manage_tags.addEvent = function() {
    var that = this;
    // 删除已选择的标签
    $("#js-content-tegs-show").on("click", "a", function() {
        var text = $(this).text();
        $(this).remove();
        $("#js-content-tegs-list").append('<a href="#"><em class="font-icon-add"></em>'+text+'</a>');
        // 检测有没有删完
        if ( $("#js-content-tegs-show a").length < 1 ) {
            $("#js-content-tegs-show").html('<p>请选择下方的标签或添加新的</p>');
        }
        that.resetValue();
        return false;
    });

    // 添加列表中的标签到显示栏
    $("#js-content-tegs-list").on("click", "a", function() {
        var text = $(this).text();
        // 检测是否超限制
        if ( that.checkMax() ) {
            alert("最多添加"+that.tagMax+"个标签");
            $("#js-newtag").val("");
            return false;
        }
        $(this).remove();
        // 添加显示之前先检测是否要清空内容
        if ( $("#js-content-tegs-show a").length < 1 ) {
            $("#js-content-tegs-show").html('');
        }
        $("#js-content-tegs-show").append('<a href="#">'+ text +'<em class="font-icon-del"></em></a>');
        that.resetValue();
        return false;
    });

    // 表单添加按钮事件
    $("#js-add-tag").click(function() {
        if ( !$("#js-newtag").val() ) {
            alert("请先输入标签");
            $("#js-newtag").val("");
            return false;
        } else {
            // 检测是否超限制
            if ( that.checkMax() ) {
                alert("最多添加"+that.tagMax+"个标签");
                $("#js-newtag").val("");
                return false;
            }
            if ( $("#js-newtag").val().length > 15 ) {
                alert("单个标签最大15个字");
                return false;
            }
            if ( that.checkRepeat($("#js-newtag").val()) ) {
                alert("标签重复！");
                return false;
            }
            // 添加显示之前先检测是否要清空内容
            if ( $("#js-content-tegs-show a").length < 1 ) {
                $("#js-content-tegs-show").html('');
            }
            $("#js-content-tegs-show").append('<a href="#">'+ $("#js-newtag").val() +'<em class="font-icon-del"></em></a>');
            $("#js-newtag").val("");
            that.resetValue();
        }
        return false;
    });
    
    // 换一批点击
    $("#js-content-tegs-resetList").click(function() {
        that.getTags();
    });
};
// 构建隐藏表单value
Manage_tags.resetValue = function() {
    var tags = [];
    $("#js-content-tegs-show a").each(function() {
        tags.push($(this).text());
    });
    $("#js-hidden-tag").val(tags.join(","));
};
//检测是否超限制
Manage_tags.checkMax = function() {
    if ( $("#js-content-tegs-show a").length >= this.tagMax ) {
        return true;
    }
    return false;
};
//检测已添加标签是否重复
Manage_tags.checkRepeat = function(str) {
    var flag = false;
    $("#js-content-tegs-show a").each(function() {
        if ( $(this).text() == str ) {
            flag = true;
        }
    });
    return flag;
};

/**
 * 会员标签选择效果
 * @return
 */
var Manage_member_tags = {};
Manage_member_tags.tagMax = 6;
Manage_member_tags.init = function() {
    this.addEvent();
    this.showSelected();
    this.getTags();
};
// 现实已经选择的标签内容
Manage_member_tags.showSelected = function() {
    var _in = $("#js-hidden-tag").val(),
        items,
        _html = ''; 
    if ( !_in ) {
        $("#js-content-tegs-show").html('<p>请选择下方的标签或添加新的</p>');
    } else {
        items = _in.split(",");
        $(items).each(function() {
            if ( !this ) { return false };
            _html += '<a href="#">'+ this +'<em class="font-icon-del"></em></a>';
        });
        $("#js-content-tegs-show").html(_html);
    }
};
Manage_member_tags.getTags = function() {
    var page = $("#js-content-tegs-list").attr("data-page") || 0,
        pagesize = 10;
    page++;
    if ( $("#js-content-tegs-list").attr("data-sum") && page > Math.ceil($("#js-content-tegs-list").attr("data-sum")/pagesize) ) {
        page = 1;
    }
    
    $.get("/tags/getaddtagslist?model=member&page="+page+"&pagesize="+pagesize+"&tags="+$("#js-hidden-tag").val(), function(data) {
        console.log("vvv222");
        if ( !data ) { return false };
        if ( typeof data == "string" ) {
            data = $.parseJSON(data);
        } else {
            data = data;
        };

        // 数据请求失败
        if ( data.code != 1 ) {
            $(".content-tegs-list").hide();
            return false;
        }

        // 没有任何标签，隐藏列表内容
        if ( data.result.length < 1 && $("#js-content-tegs-list a").length < 1 ) {
            $(".content-tegs-list").hide();
            return false;
        }

        // 初始化列表内容
        $("#js-content-tegs-list").attr("data-page", data.pages.page);
        $("#js-content-tegs-list").attr("data-sum", data.pages.sum);
        var _html = '';
        $(data.result).each(function() {
            _html += '<a href="#"><em class="font-icon-add"></em>'+this+'</a>';
        });
        $("#js-content-tegs-list").html(_html);

    });
};
Manage_member_tags.addEvent = function() {
    var that = this;
    // 删除已选择的标签
    $("#js-content-tegs-show").on("click", "a", function() {
        var text = $(this).text();
        $(this).remove();
        $("#js-content-tegs-list").append('<a href="#"><em class="font-icon-add"></em>'+text+'</a>');
        // 检测有没有删完
        if ( $("#js-content-tegs-show a").length < 1 ) {
            $("#js-content-tegs-show").html('<p>请选择下方的标签或添加新的</p>');
        }
        that.resetValue();
        return false;
    });

    // 添加列表中的标签到显示栏
    $("#js-content-tegs-list").on("click", "a", function() {
        var text = $(this).text();
        // 检测是否超限制
        if ( that.checkMax() ) {
            alert("最多添加"+that.tagMax+"个标签");
            $("#js-newtag").val("");
            return false;
        }
        $(this).remove();
        // 添加显示之前先检测是否要清空内容
        if ( $("#js-content-tegs-show a").length < 1 ) {
            $("#js-content-tegs-show").html('');
        }
        $("#js-content-tegs-show").append('<a href="#">'+ text +'<em class="font-icon-del"></em></a>');
        that.resetValue();
        return false;
    });

    // 表单添加按钮事件
    $("#js-add-tag").click(function() {
        if ( !$("#js-newtag").val() ) {
            alert("请先输入标签");
            $("#js-newtag").val("");
            return false;
        } else {
            // 检测是否超限制
            if ( that.checkMax() ) {
                alert("最多添加"+that.tagMax+"个标签");
                $("#js-newtag").val("");
                return false;
            }
            if ( $("#js-newtag").val().length > 15 ) {
                alert("单个标签最大15个字");
                return false;
            }
            if ( that.checkRepeat($("#js-newtag").val()) ) {
                alert("标签重复！");
                return false;
            }
            // 添加显示之前先检测是否要清空内容
            if ( $("#js-content-tegs-show a").length < 1 ) {
                $("#js-content-tegs-show").html('');
            }
            $("#js-content-tegs-show").append('<a href="#">'+ $("#js-newtag").val() +'<em class="font-icon-del"></em></a>');
            $("#js-newtag").val("");
            that.resetValue();
        }
        return false;
    });
    
    // 换一批点击
    $("#js-content-tegs-resetList").click(function() {
        that.getTags();
    });
};
// 构建隐藏表单value
Manage_member_tags.resetValue = function() {
    var tags = [];
    $("#js-content-tegs-show a").each(function() {
        tags.push($(this).text());
    });
    $("#js-hidden-tag").val(tags.join(","));
};
//检测是否超限制
Manage_member_tags.checkMax = function() {
    if ( $("#js-content-tegs-show a").length >= this.tagMax ) {
        return true;
    }
    return false;
};
//检测已添加标签是否重复
Manage_member_tags.checkRepeat = function(str) {
    var flag = false;
    $("#js-content-tegs-show a").each(function() {
        if ( $(this).text() == str ) {
            flag = true;
        }
    });
    return flag;
};



/**
 * 会员管理
 * @return
 */
var ManageMember = {};
ManageMember.init = function() {
    this.edit();
    this.editinfo();
    
    // 初始化标签选择效果
    if ( document.getElementById("js-manageMember-editinfo-form") ) {
        Manage_member_tags.init();
    }
};

/**
 * 修改会员帐号
 * @return
 */
ManageMember.edit = function() {
    if ( !document.getElementById("js-manageMember-edit-form") ) { return false };
    var vip = $('#js-manageMember-edit-form input[name="vip"]').val(),
        vip_show_elem = $('#js-manageMember-edit-form input[name="vip_show"]');
    // 初始化vip显示
    if ( vip ) {
        vip = vip.split(",");
        vip_show_elem.each(function() {
            var in_elem = this,
                _value = $(in_elem).val();
            $(vip).each(function() {
                if ( _value == this ) {
                    in_elem.checked = true;
                }
            });
        });
    }

    $('#js-manageMember-edit-form').submit(function() {
        var _form = this;
        if ( !_form.email.value ) {
            alert("邮箱必须填写！");
            _form.email.focus();
            return false;
        }
        if ( !chackMail(_form.email.value) ) {
            alert("请填写正确的邮箱！");
            _form.email.select();
            return false;
        }

        if ( !_form.username.value ) {
            alert("昵称必须填写！");
            _form.username.focus();
            return false;
        }
        if ( _form.lock.value === "1" && !_form.lockMessage.value ) {
            alert("锁定原因必须填写！");
            _form.lockMessage.focus();
            return false;
        }

        // 处理vip权限
        var vipvalue = [];
        $(vip_show_elem).each(function() {
            if ( this.checked == true ) {
                vipvalue.push(this.value);
            }
        });
        _form.vip.value = vipvalue.join(",");

        // 提交数据
        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/member/edit",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location.reload();
                        }
                    });
                } else {// 失败
                    alert(data.message);
                }
            }
        });
        return false;
    });
};
/**
 * 修改会员信息
 * @return
 */
ManageMember.editinfo = function() {
    if ( !document.getElementById("js-manageMember-editinfo-form") ) { return false };
    
    $('#js-manageMember-editinfo-form').submit(function() {
        var _form = this;

        // 先看添加标签的表单有没有内容，有内容则代表添加标签
        if ( $("#js-newtag").val() ) {
            // 检测是否超限制
            if ( Manage_member_tags.checkMax() ) {
                alert("最多添加"+Manage_member_tags.tagMax+"个标签");
                $("#js-newtag").val("");
                return false;
            }
            if ( $("#js-newtag").val().length > 15 ) {
                alert("单个标签最大15个字");
                return false;
            }
            if ( Manage_member_tags.checkRepeat($("#js-newtag").val()) ) {
                alert("标签重复！");
                return false;
            }
            // 添加显示之前先检测是否要清空内容
            if ( $("#js-content-tegs-show a").length < 1 ) {
                $("#js-content-tegs-show").html('');
            }
            $("#js-content-tegs-show").append('<a href="#">'+ $("#js-newtag").val() +'<em class="font-icon-del"></em></a>');
            $("#js-newtag").val("");
            Manage_member_tags.resetValue();
            return false;
        }
        
        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/member/editinfo",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location.reload();
                        }
                    });
                } else {// 失败
                    alert(data.message);
                }
            }
        });
        return false;
    });
};


/**
 * 评论管理
 * @return
 */
var Comment = {};
Comment.init = function() {
    this.hide();
    this.del();
    this.show();
};
/**
 * 隐藏评论
 * @return
 */
Comment.hide = function() {
    $(".js-comment-hide").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要隐藏这条评论？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/comment/hide/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};
/**
 * 显示评论
 * @return
 */
Comment.show = function() {
    $(".js-comment-show").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要显示这条评论？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/comment/show/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};
/**
 * 删除评论
 * @return
 */
Comment.del = function() {
    $(".js-comment-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这条评论？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/comment/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function(that) {
                        $(that.content).find(".D_submit").focus();
                    },
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};


/**
 * 招聘分类管理
 * @return
 */
var JobChannels = {};
JobChannels.init = function() {
    this.create();
    this.del();
};

/**
 * 创建招聘分类
 * @return
 */
JobChannels.create = function() {
    if ( !document.getElementById("js-jobChannels-create-form") ) { return false };
    
    $('#js-jobChannels-create-form').submit(function() {
        var _form = this;
        if ( _form.parent.value == 0 ) {
            alert("请选择归属！");
            _form.parent.focus();
            return false;
        }

        if ( !_form.name.value ) {
            alert("分类名称必须填写！");
            _form.name.focus();
            return false;
        }
        
        if ( !_form.order.value ) {
            alert("排序必须填写！");
            _form.order.focus();
            return false;
        }

        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/jobs/channel/create",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location = "/manage/jobs/channel";
                        }
                    });
                } else {// 失败
                    alert(data.message);
                }
            }
        });
        return false;
    });
};

/**
 * 删除招聘分类
 * @return
 */
JobChannels.del = function() {
    $(".js-jobChannels-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这个分类？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/jobs/channel/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function(that) {
                        $(that.content).find(".D_submit").focus();
                    },
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};


/**
 * 招聘分类管理
 * @return
 */
var Job = {};
Job.init = function() {
    this.comdel();
    this.applyDel();
    this.addevent();
    this.submit();
};
/**
 * 删除招聘企业
 * @return
 */
Job.comdel = function() {
    $(".js-job-com-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这条企业信息？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/jobs/companys/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function(that) {
                        $(that.content).find(".D_submit").focus();
                    },
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};

/**
 * 删除求职纪录
 * @return
 */
Job.applyDel = function() {
    $(".js-apply-delete").click(function() {
        var id = $(this).attr("data-id");
        if( confirm("确定要删除这条求职纪录？") ) {
            request(id);
        };
        return false;
    });

    function request(id) {
        $.get("/manage/jobs/jobapply/del/"+id, function( data ) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            };

            if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function(that) {
                        $(that.content).find(".D_submit").focus();
                    },
                    "onComplete": function() {
                       window.location.reload();
                    }
                });
            } else {// 失败
                alert(data.message);
            }
        });
    };
};

/**
 * 招聘相关事件
 * @return
 */
Job.addevent = function() {
    if ( document.getElementById("js-company-info-form") ) {
        // 公司领域最多选择三个
        var realms = $('#js-company-info-form input[name="realm"]');
        realms.click(function() {
            var checkedRealms = 0;
            realms.each(function() {
                if ( this.checked ) {
                    checkedRealms++;
                }
            });
            if ( checkedRealms > 3 ) {
                $(this).removeAttr("checked")[0].checked = false;
                alert("公司领域最多选择三个！");
            }
        });
    }

    // 注册点击下线
    $(".js-job-cancel").click(function() {
        var id = $(this).attr("data-id");
        if ( confirm("确定要将此招聘下线？") ) {
            action();
        };
        function action() {
            $.get("/manage/jobs/cancel/"+id, function(data) {
                var data;
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                }

                if ( data.status == 200 && data.code && data.code == 1 ) {// 操作成功
                    window.location.reload();
                } else {// 操作失败
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onReady": function() {
                            $(".D_submit").focus();
                        }
                    });
                }
            });
        }
        
        return false;
    });

    // 注册点击上线
    $(".js-job-online").click(function() {
        var id = $(this).attr("data-id");
        if ( confirm("确定要将此招聘上线？") ) {
            action();
        };
        function action() {
            $.get("/manage/jobs/online/"+id, function(data) {
                var data;
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                }

                if ( data.status == 200 && data.code && data.code == 1 ) {// 操作成功
                    window.location.reload();
                } else {// 操作失败
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onReady": function() {
                            $(".D_submit").focus();
                        }
                    });
                }
            });
        }
        
        return false;
    });
};

Job.submit = function() {
    $('#js-company-info-form').submit(function() {
        var _form = this;
        if ( !_form.name.value ) {
            alert("公司名称必须填写！");
            _form.name.focus();
            return false;
        }
        if ( _form.name.value.length > 20 ) {
            alert("公司名称最多20个字！");
            _form.name.focus();
            return false;
        }

        if ( _form.intro.value && _form.intro.value.length > 50 ) {
            alert("一句话简介最多50个字！");
            _form.intro.focus();
            return false;
        }
        
        var realms = 0;
        $(_form).find("input[name='realm']").each(function() {
            if ( this.checked ) {
                realms++;
            }
        });
        if ( realms === 0 ) {
            alert("请选择公司领域");
            _form.realm[0].focus();
            return false;
        }
        if ( realms > 3 ) {
            alert("公司领域最多选择三项！");
            _form.realm[0].focus();
            return false;
        }

        if ( !_form.scale.value ) {
            alert("请选择公司规模！");
            _form.scale.focus();
            return false;
        }

        if ( !_form.seedtime.value ) {
            alert("请选择发展阶段！");
            _form.seedtime.focus();
            return false;
        }

        if ( !_form.address.value ) {
            alert("请填写公司地址！");
            _form.address.focus();
            return false;
        }
        if ( _form.address.value.length > 50 ) {
            alert("公司地址最多50个字！");
            _form.address.focus();
            return false;
        }

        // if ( _form.www && _form.www.value.indexOf("http") < 0 ) {
        //     alert("公司主页必须以http开头！");
        //     _form.www.focus();
        //     return false;
        // }

        if ( !_form.contactName.value ) {
            alert("请填写联系人！");
            _form.contactName.focus();
            return false;
        }

        if ( _form.contactName.value.length > 10 ) {
            alert("联系人名字最多10个字！");
            _form.contactName.focus();
            return false;
        }

        if ( !_form.tel.value ) {
            alert("请填写联系电话！");
            _form.tel.focus();
            return false;
        }
        if ( _form.tel.value.length > 15 ) {
            alert("联系电话最多15个字！");
            _form.tel.focus();
            return false;
        }

        if ( !_form.mail.value ) {
            alert("请填写联系邮箱！");
            _form.mail.focus();
            return false;
        }

        if ( !chackMail(_form.mail.value) ) {
            alert("请填写正确的邮箱！");
            _form.mail.focus();
            return false;
        }

        if ( !_form.content.value ) {
            alert("公司简介必须填写！");
            _form.content.focus();
            return false;
        }
        if ( _form.content.value.length > 5000 ) {
            alert("公司简介太多了，删减一点吧！");
            _form.content.focus();
            return false;
        }

        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/jobs/companys/submit",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onReady": function() {
                            $(".D_submit").focus();
                        },
                        "onComplete": function() {
                            if ( data.editLogo ) {
                                showEditorLogo();
                            } else {
                                window.location = "/manage/jobs/companys";
                            }
                        }
                    });
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
                            if ( data.reload ) {
                                window.location.reload();
                            }
                        }
                    });
                }
            }
        });
        return false;
    });

    $('#js-job-edit-form').submit(function() {
        var _form = this;
        if ( !_form.channelId.value ) {
            alert("请选择招聘岗位！");
            _form.channelId.focus();
            return false;
        }

        if ( !_form.title.value ) {
            alert("请填写招聘标题！");
            _form.title.focus();
            return false;
        }
        if ( _form.title.value.length > 30 ) {
            alert("招聘标题最多30个字！");
            _form.title.focus();
            return false;
        }

        if ( !_form.allure.value ) {
            alert("请填写职位诱惑！");
            _form.allure.focus();
            return false;
        }
        if ( _form.allure.value.length > 30 ) {
            alert("职位诱惑最多30个字！");
            _form.allure.focus();
            return false;
        }

        if ( isNaN(parseInt(_form.jobbase.value)) ) {
            alert("请填写岗位现有人数！");
            _form.jobbase.focus();
            return false;
        }
        if ( isNaN(parseInt(_form.jobmax.value)) ) {
            alert("请填写岗位扩充到多少人！");
            _form.jobmax.focus();
            return false;
        }
        if ( parseInt(_form.jobmax.value) <= parseInt(_form.jobbase.value) ) {
            alert("扩充人数要比现有人数多！");
            _form.jobmax.focus();
            return false;
        }

        if ( _form.address.value && _form.address.value.length > 50 ) {
            alert("工作地址最多50个字！");
            _form.address.focus();
            return false;
        }

        if ( isNaN(parseInt(_form.salaryStart.value)) ) {
            alert("请填写薪资范围起始值！");
            _form.salaryStart.focus();
            return false;
        }
        if ( isNaN(parseInt(_form.salaryEnd.value)) ) {
            alert("请填写薪资范围最大值！");
            _form.salaryEnd.focus();
            return false;
        }
        if ( parseInt(_form.salaryEnd.value) <= parseInt(_form.salaryStart.value) ) {
            alert("薪资最大值要比起始值大！");
            _form.salaryEnd.focus();
            return false;
        }
        if ( parseInt(_form.salaryEnd.value) > parseInt(_form.salaryStart.value)*2 ) {
            alert("薪资范围跨度不能太大！");
            _form.salaryEnd.focus();
            return false;
        }

        if ( _form.contactName.value && _form.contactName.value.length > 10 ) {
            alert("联系人名字最多10个字！");
            _form.contactName.focus();
            return false;
        }

        if ( _form.tel.value && _form.tel.value.length > 15 ) {
            alert("联系电话最多15个字！");
            _form.tel.focus();
            return false;
        }

        if ( _form.mail.value && !chackMail(_form.mail.value) ) {
            alert("请填写正确的邮箱！");
            _form.mail.focus();
            return false;
        }

        if ( !_form.email.value ) {
            alert("请填写发布者邮箱！");
            _form.email.focus();
            return false;
        }
        if ( !chackMail(_form.email.value) ) {
            alert("请填写正确的发布者邮箱！");
            _form.email.focus();
            return false;
        }

        if ( !_form.content.value ) {
            alert("职位描述必须填写！");
            _form.content.focus();
            return false;
        }
        if ( _form.content.value.length > 5000 ) {
            alert("职位描述太多了，删减一点吧！");
            _form.content.focus();
            return false;
        }

        var formData = $(_form).serialize();
        $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
        $.ajax({
            method: "POST",
            url: "/manage/jobs/edit",
            data: formData,
            success:function( data ) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                $(_form).find("input[type='submit']").val("提交").attr("disabled", false);

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    Dialog({
                        "msg":"<br />"+ data.message +"<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location = "/manage/jobs";
                        }
                    });
                } else {// 失败
                    alert(data.message);
                }
            }
        });
        return false;
    });
};



function calendarInit() {
    var calendar = $('.js-calendar').datepicker().on('changeDate', function(ev) {
          calendar.hide();
        }).data('datepicker');
};


/**
 * 启动
 * @return
 */
function domready() {
    manageMenuInit();
    Active.init();
    Join.init();

    ArticleCrumbs.init();
    ArticleChannels.init();
    ActiveChannels.init();
    Tags.init();
    Donation.init();
    ManageUser.init();
    manageLogin();
    ManageMember.init();


    Article.init();

    Comment.init();

    calendarInit();

    JobChannels.init();
    Job.init();
};



require(["jquery", "dialog", "moment", "datepicker"], function($, Dialog) {
    domready();
    
    // 让页面中的自定义方法也可以执行
    if ( typeof pageInit === "function" ) {
        pageInit();
    }
});

