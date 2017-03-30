define(['jquery', 'dialog'], function($) {
    function addInit() {
        $('#js-article-create-form').submit(function() {
            var _form = this;
            var linkUrl = _form.linkUrl.value;
            
            linkUrl = linkUrl.replace("https://", "");
            linkUrl = linkUrl.replace("http://", "");

            // 先看添加标签的表单有没有内容，有内容则代表添加标签
            if ( $("#js-newtag").val() ) {
                // 检测是否超限制
                if ( tags.checkMax() ) {
                    alert("最多添加"+tags.tagMax+"个标签");
                    $("#js-newtag").val("");
                    return false;
                }
                if ( $("#js-newtag").val().length > 15 ) {
                    alert("单个标签最大15个字");
                    return false;
                }
                if ( tags.checkRepeat($("#js-newtag").val()) ) {
                    alert("标签重复！");
                    return false;
                }
                // 添加显示之前先检测是否要清空内容
                if ( $("#js-content-tegs-show a").length < 1 ) {
                    $("#js-content-tegs-show").html('');
                }
                $("#js-content-tegs-show").append('<a href="#">'+ $("#js-newtag").val() +'<em class="font-icon-del"></em></a>');
                $("#js-newtag").val("");
                tags.resetValue();
                return false;
            }

            if ( !_form.title.value ) {
                alert("标题必须填写！");
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

            if ( _form.code && !_form.code.value ) {
                _form.code.focus();
                alert("填写验证码后再提交！");
                return false;
            }

            // if ( _form.aid ) {
            //     if ( !confirm("提交修改后这篇文章将会进入未审核状态\n您确定修改吗？") ) {
            //         return false;
            //     };
            // };

            var formData = $(_form).serialize();
            $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
            $.ajax({
                method: "POST",
                url: "/article/create",
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
                               window.location = "/user/myarticle";
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

    /**
     * 设置跳转链接显示状态
     */
    function setLinkUrl() {
        if ( !document.getElementById("js-linkType") ) { return false };
        var elem = $("#js-linkType")[0];
        if ( elem.checked ) {
            $("#js-linkUrl-box").show();
            $("#js-articleadd-source, #js-articleadd-content, #js-articleadd-tag, #js-articleadd-description, #editor").hide();
        } else {
            $("#js-linkUrl-box").hide();
            $("#js-articleadd-source, #js-articleadd-content, #js-articleadd-tag, #js-articleadd-description, #editor").show();
        }
    };


    /**
     * 标签选择效果
     * @return
     */
    var tags = {};
    tags.tagMax = 6;
    tags.init = function() {
        this.addEvent();
        this.showSelected();
        this.getTags();
    };
    // 现实已经选择的标签内容
    tags.showSelected = function() {
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
    tags.getTags = function() {
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
    tags.addEvent = function() {
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
    tags.resetValue = function() {
        var tags = [];
        $("#js-content-tegs-show a").each(function() {
            tags.push($(this).text());
        });
        $("#js-hidden-tag").val(tags.join(","));
    };
    //检测是否超限制
    tags.checkMax = function() {
        if ( $("#js-content-tegs-show a").length >= this.tagMax ) {
            return true;
        }
        return false;
    };
    //检测已添加标签是否重复
    tags.checkRepeat = function(str) {
        var flag = false;
        $("#js-content-tegs-show a").each(function() {
            if ( $(this).text() == str ) {
                flag = true;
            }
        });
        return flag;
    };

    // markdown编辑器初始化
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

    var addArticle = {};
    addArticle.init = function() {
        addInit();

        setLinkUrl();
        $("#js-linkType").change(function() {
            setLinkUrl();
        });

        // 初始化标签选择效果
        tags.init();

        // markdown编辑器初始化
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

    return addArticle;
});