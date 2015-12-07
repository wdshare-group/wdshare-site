define(['jquery', 'dialog'], function($) {
    function addInit() {
        $('#js-article-create-form').submit(function() {
            var _form = this;
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
            if ( !_form.linkUrl.value && !_form.content.value ) {
                alert("内容必须填写！");
                _form.content.focus();
                return false;
            }

            if ( _form.code && !_form.code.value ) {
                _form.code.focus();
                alert("填写验证码后再提交！");
                return false;
            }

            if ( _form.aid ) {
                if ( !confirm("提交修改后这篇文章将会进入未审核状态\n您确定修改吗？") ) {
                    return false;
                };
            };

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


    var addArticle = {};
    addArticle.init = function() {
        addInit();

        setLinkUrl();
        $("#js-linkType").change(function() {
            setLinkUrl();
        });
    };

    return addArticle;
});