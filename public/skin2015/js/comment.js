define(['jquery', 'dialog', 'autosize'], function($, dialog, autosize) {
    
    /**
     * 获取评论列表信息
     * @return
     */
    function get() {
        if ( !document.getElementById("js-comment-list") || !document.getElementById("js-archives-id") || !document.getElementById("js-archives-model") ) { return false };
        var param = {};
        param.id = $("#js-archives-id").val(),
        param.model = $("#js-archives-model").val();

        $.get("/comment/get", param, function(data) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            }
            if ( data.code !== 1 ) {// 返回错误信息
                $("#js-comment-list").hide();
            } else {
                $("#js-comment-list").html("");
                data.data = data.data.reverse();
                $(data.data).each(function(i) {
                    var _date = this.addDate,
                        interval = this.nowDate - _date,
                        dataString = "刚刚",
                        count,
                        formatDate = new Date(_date),
                        textDate,
                        _html = '';
                    // 分钟级别
                    if ( interval > 1000*60*5 ) {
                        count = Math.floor(interval/(1000*60));
                        dataString = count + "分钟前";
                    }
                    if ( interval > 1000*60*30 ) {
                        dataString = "半小时前";
                    }
                    if ( interval > 1000*60*60 ) {
                        count = Math.floor(interval/(1000*60*60));
                        dataString = count + "小时前";
                    }
                    if ( interval > 1000*60*60*24 ) {
                        count = Math.floor(interval/(1000*60*60*24));
                        dataString = count + "天前";
                    }
                    if ( interval > 1000*60*60*24*365 ) {
                        count = Math.floor(interval/(1000*60*60*24*365));
                        dataString = count + "年前";
                    }

                    textDate = formatDate.getFullYear() +"-"+ (formatDate.getMonth()+1) +"-"+ formatDate.getDate() +" "+ formatDate.getHours() +":"+ formatDate.getMinutes() +":"+ formatDate.getSeconds();

                    _html += '<div class="comment-item" data-id="'+this._id+'">';
                    _html += '    <div class="comment-item-face"><a href="/user/'+this.userid+'"><img src="/user/face/'+this.userid+'" title="'+this.username+'" /></a></div>';
                    _html += '    <div class="comment-item-text">';
                    _html += '        <div class="comment-item-head">';
                    _html += '            <a href="/user/face/'+this.userid+'" class="comment-item-name">'+this.username+'</a>';
                    _html += '            <span class="comment-item-date" title="'+textDate+'">'+dataString+' 说：</span>';
                    if ( this.system && this.system != "Windows" ) {
                        _html += '            <span class="comment-item-system">来自 '+this.system+'</span>';
                    }
                    if ( this.privacy ) {
                        _html += '            <span class="comment-item-privacy" title="只有发送人和接收人可以看见">私密消息</span>';
                    }
                    _html += '        </div>';
                    _html += '        <div class="comment-item-body">'+this.content+'</div>';
                    _html += '        <div class="comment-item-foot">';
                    _html += '            <a href="#" class="comment-item-zan" data-id="'+this._id+'">赞(<span>'+this.zan+'</span>)</a>';
                    if ( !this.quote && document.getElementById("js-comment-form") ) {
                        _html += '            <a href="#" class="comment-item-reply" data-id="'+this._id+'">回复此楼</a>';
                    }
                    if ( this.quote && document.getElementById("js-comment-form") ) {
                        _html += '            <a href="#" class="comment-item-replyChild" data-id="'+this._id+'">回复</a>';
                    }
                    if ( this.master ) {
                        _html += '            <a href="#" class="comment-item-del" data-id="'+this._id+'">删除</a>';
                    }
                    _html += '        </div>';
                    _html += '    </div>';
                    _html += '</div>';

                    if ( !this.quote ) {
                        // $("#js-comment-list").append(_html);// 这两个插入方式可用来排序
                        $("#js-comment-list").prepend(_html);
                    } else {
                        // 不存在子列表父节点是创建
                        if ( $("#js-comment-list div[data-id='"+this.quote+"'] .comment-item-childList").length < 1 ) {
                            $("#js-comment-list div[data-id='"+this.quote+"'] .comment-item-foot").after("<div class='comment-item-childList'></div>");
                        }
                        // 插入子评论
                        $("#js-comment-list div[data-id='"+this.quote+"'] .comment-item-childList").prepend(_html);
                    }
                });
                
                if ( param.model == "message" ) {
                    $("#js-comment-list").prepend('<div class="comment-count">共有'+data.data.length+'条留言</div>');
                } else {
                    $("#js-comment-list").prepend('<div class="comment-count">共有'+data.data.length+'条评论</div>');
                }
                $(".js-comment-count").html(data.data.length);

                if ( data.data.length == 0 ) {
                    $("#js-comment-list").html("哎呦，我将成为第一个评论的人！");
                }

                if ( data.data.length == 0 && param.model == "message" ) {
                    $("#js-comment-list").html("很荣幸，您将成为第一个留言的人！");
                }
            }
        });
    };

    /**
     * 发表评论
     * @return
     */
    function add(elem) {
        if ( !elem ) { return false };
        $(elem).submit(function() {
            var _form = this;
            if ( !_form.title.value ) {
                alert("标题必须填写！");
                _form.title.focus();
                return false;
            }
            
            if ( !_form.content.value ) {
                alert("填写内容后再提交吧！");
                _form.content.focus();
                return false;
            }
            if ( _form.content.value.length <= 2 ) {
                alert("真懒，多写几个字！");
                _form.content.focus();
                return false;
            }
            if ( _form.content.value.length > 500 ) {
                alert("别闹，这么多文字，提交不了，缩减到500以内吧！");
                _form.content.focus();
                return false;
            }

            var formData = $(_form).serialize();
            $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
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
                               // window.location.reload();
                            }
                        });
                        createMyNewComment(data.data);
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
                                $("#code").attr("src", $("#code").attr("src")+'?'+new Date().getTime());
                                $("#code-child").attr("src", $("#code").attr("src"));
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
        
        // texrarea添加高度变化
        autosize($(elem).find("textarea"));
    };

    /**
     * 创建我自己干发布的评论
     * @param  {Object} data 本条评论提交给服务器后返回的内容
     * @return
     */
    function createMyNewComment(data) {
        var _html = '';

        _html += '<div class="comment-item comment-item-temporary">';
        _html += '    <div class="comment-item-face"><a><img src="/user/face/'+data.userid+'" title="'+data.username+'" /></a></div>';
        _html += '    <div class="comment-item-text">';
        _html += '        <div class="comment-item-head">';
        _html += '            <a class="comment-item-name">我</a>';
        _html += '            <span class="comment-item-date">刚刚 说：</span>';
        _html += '        </div>';
        _html += '        <div class="comment-item-body">'+data.content+'</div>';
        _html += '    </div>';
        _html += '</div>';

        if ( !data.quote ) {// 主回复
            if ( $("#js-comment-list .comment-item").length > 0 ) {
                $("#js-comment-list .comment-item").eq(0).before(_html);
            } else {
                $("#js-comment-list").html(_html);
            }

            $("#js-comment-form textarea").val("");
            $("#js-comment-form .comment-form-code input").val("");
            $("#code").attr("src", $("#code").attr("src") +'?'+new Date().getTime());
        } else {// 子回复
            var parent = $("#js-comment-list div[data-id='"+data.quote+"']"),
                childList = parent.find(".comment-item-childList");

            if ( childList.length > 0 ) {// 已有子回复
                childList.prepend(_html);
            } else {// 没有子回复
                parent.find(".comment-item-foot").after('<div class="comment-item-childList">'+_html+'</div>');
            }

            // 回复成功，销毁已展开的子表单
            $("#js-comment-list form").remove();

            // 更新验证码
            $("#code").attr("src", $("#code").attr("src") +'?'+new Date().getTime());
        }
    };

    /**
     * 添加相关事件
     * @return
     */
    function addEvent() {
        $("#js-comment").on("click", ".comment-item-del", function() {
            removeComment(this);
            return false;
        });
        $("#js-comment").on("click", ".comment-item-zan", function() {
            setZan(this);
            return false;
        });
        $("#js-comment").on("click", ".comment-item-reply", function() {
            replyComment(this);
            return false;
        });
        $("#js-comment").on("click", ".comment-item-replyChild", function() {
            var that = this;

            replyComment($(this).parents(".comment-item").eq(1).find(".comment-item-reply"), function() {
                var he = $(that).parents(".comment-item-text").eq(0).find(".comment-item-name").html();
                console.log(he);
                $(that).parents(".comment-item").eq(1).find("textarea").val("@"+ he +" ");
            });
            return false;
        });
    };

    /**
     * 删除评论
     * @return
     */
    function removeComment(elem) {
        if ( !elem ) { return false };

        var id = $(elem).attr("data-id"),
            url = "/comment/del/"+id;

        if ( confirm("确定要删除该评论？") ) {
            action();
        };

        function action() {
            var parent = $(elem).parents(".comment-item").eq(0);
            parent.addClass("comment-del-note");
            parent.append('<div class="comment-del-note-text"><p>数据删除中...</p></div>');
            $.get(url, function(data) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                };

                if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                    parent.find(".comment-del-note-text p").html("删除成功！");
                    setTimeout(function() {
                        $(parent).animate({
                            opacity: 'hide',
                            height: 0
                        }, 500, function() {
                            $(parent).remove();
                        });
                    }, 2000);
                } else {// 失败
                    parent.find(".comment-del-note-text p").html("删除失败，请刷新重试！");
                }
            });
        };
    };

    /**
     * 评论点赞
     * @return
     */
    var comment_zan_count = 0;
    function setZan(elem) {
        if ( !elem ) { return false };

        var id = $(elem).attr("data-id"),
            url = "/comment/setzan/"+id;

        if ( comment_zan_count >= 5 ) {
            Dialog("点赞啪啪啪，很过瘾吧！歇会儿");
            return false;
        }

        $.get(url, function(data) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            }

            if ( data.code && data.code === 1 ) {// 成功
                setzan();
            } else {
                if ( data.url ) {// 报错情况下需要跳转时进行处理
                    window.location = data.url;
                }
                alert(data.msg);
                return false;
            };
        });

        function setzan() {
            var zanCount = $(elem).find("span"),
                count = parseInt($(zanCount).html()) + 1;
            $(zanCount).html(count);
            comment_zan_count++;
        };
    };


    function replyComment(elem, callback) {
        var id = $(elem).attr("data-id"),
            _footform = $("#js-comment-form")[0],// 主回复表单
            typeid = _footform.typeid.value,
            model = _footform.model.value,
            title = _footform.title.value,
            userface = $("#js-comment-form .comment-form-user").html(),
            placeholder = $("#js-comment-form textarea").attr("placeholder"),
            code = $("#js-comment-form .comment-form-code"),
            parent = $(elem).parents(".comment-item-foot"),
            _html = '',
            codehtml;

        /*// 检测是关闭还是打开【暂时不需要这个检测，让每次点击都打开表单】
        var childForm = $(elem).parents(".comment-item-text").find("form");
        if ( childForm.length > 0 ) {
            childForm.remove();
            return false;
        }*/

        // 先移除所有已经打开的子回复表单
        $("#js-comment-list form").remove();


        _html += '<form id="js-comment-form-'+id+'" name="comment-form-'+id+'" method="post">';
        _html += '  <input type="hidden" name="typeid" value="'+typeid+'">';
        _html += '  <input type="hidden" name="model" value="'+model+'">';
        _html += '  <input type="hidden" name="title" value="'+title+'">';
        _html += '  <input type="hidden" name="quote" value="'+id+'">';
        _html += '  <input type="hidden" name="privacy" value="0">';
        _html += '  <div class="comment-form-box">';
        _html += '    <div class="comment-form-user">'+userface+'</div>';
        _html += '    <div class="comment-form-body">';
        _html += '      <textarea name="content" placeholder="'+placeholder+'"></textarea>';
        if ( code.length > 0 ) {
            codehtml = code.html();
            codehtml = codehtml.replace(/id="code"/, 'id="code-child"');
            _html += '    <div class="comment-form-code">'+codehtml+'</div>';
        }
        _html += '      <div class="comment-form-but">';
        _html += '        <input type="submit" class="but-blue" name="button" value="提交">';
        _html += '      </div>';
        _html += '    </div>';
        _html += '  </div>';
        _html += '</form>';

        $(parent).after(_html);

        // 注册表单提交方法
        add($(elem).parents(".comment-item-text").find("form"));

        // 让子表单获取焦点
        $("#js-comment-list form textarea").focus();

        if ( callback ) {
            callback();
        }
    };

    var comment = {};
    comment.init = function() {
        get();
        add(document.getElementById("js-comment-form"));
        addEvent();
    };

    return comment;
});