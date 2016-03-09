define(['jquery', 'dialog'], function($) {
    var editor = {};
    editor._form = document.getElementById("js-edit-form");

    editor.editSubmit = function() {
        var form = this._form,
            param = $(form).serialize(),
            that = this;

        // 先看添加标签的表单有没有内容，有内容则代表添加标签
        if ( $("#js-newtag").val() ) {
            if ($("#js-newtag").val().indexOf("<") >= 0) {
                alert("标签中含有非法字符！");
                return false;
            }
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

        form.submitbutton.value = "稍等...";
        form.submitbutton.disabled = true;

        // 检查昵称有没有被修改
        if ( that._form.nickname.value === oldNickname ) {
            param = "nickname=" + param.substring(param.indexOf("&"));
        }

        $.post("/user/editInfo", param, function(data) {
            var data;
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            } else {
                data = data;
            }

            form.submitbutton.value = "保存";
            form.submitbutton.disabled = false;

            if ( data.status == 200 && data.code && data.code == 1 ) {// 保存成功
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "time": 3000,
                    "onReady": function() {
                        $(".D_submit").focus();
                    },
                    "onComplete": function() {
                        window.location = "/user/";
                    }
                });
                if ( data.url ) {
                    window.location = data.url;
                }
            } else {// 保存失败
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
    };


    editor.check = function() {
        var elem = this._form;
        if ( !elem.nickname.value ) {
            Dialog({
                "msg":"<br />昵称不能为空！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.nickname.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }
        if ( elem.nickname.value.length > 16 ) {
            Dialog({
                "msg":"<br />昵称不能大于16个字！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.nickname.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.mood.value && elem.mood.value.length > 200 ) {
            Dialog({
                "msg":"<br />签名不能大于200个字！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.mood.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.realname.value && elem.realname.value.length > 10 ) {
            Dialog({
                "msg":"<br />真实姓名不能大于10个字！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.realname.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        // 转换标签中的中文逗号
        if ( elem.tag.value ) {
            elem.tag.value = elem.tag.value.replace(/，/g, ",");
            elem.tag.value = elem.tag.value.replace(/;/g, ",");
            elem.tag.value = elem.tag.value.replace(/；/g, ",");
            elem.tag.value = elem.tag.value.replace(/ /g, ",");
        }

        if ( elem.tag.value && elem.tag.value.length > 50 ) {
            Dialog({
                "msg":"<br />技能标签不能大于50个字！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.tag.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.com.value && elem.com.value.length > 32 ) {
            Dialog({
                "msg":"<br />公司名称不能大于32个字！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.com.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.jobs.value && elem.jobs.value.length > 32 ) {
            Dialog({
                "msg":"<br />职位名称不能大于32个字！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.jobs.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.school.value && elem.school.value.length > 32 ) {
            Dialog({
                "msg":"<br />学校名称不能大于32个字！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.school.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.phone.value && elem.phone.value.length > 11 ) {
            Dialog({
                "msg":"<br />请输入正确的手机号码！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.phone.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.qq.value && elem.qq.value.length > 32 ) {
            Dialog({
                "msg":"<br />QQ号不能大于32位！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.qq.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.wechat.value && elem.wechat.value.length > 32 ) {
            Dialog({
                "msg":"<br />微信号不能大于32位！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.wechat.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.www.value && elem.www.value.length > 64 ) {
            Dialog({
                "msg":"<br />个人网站地址不能大于64位！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.www.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.weibo.value && elem.weibo.value.length > 64 ) {
            Dialog({
                "msg":"<br />微博地址不能大于64位！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.weibo.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.github.value && elem.github.value.length > 64 ) {
            Dialog({
                "msg":"<br />Github地址不能大于64位！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.github.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }

        if ( elem.introduction.value && elem.introduction.value.length > 1000 ) {
            Dialog({
                "msg":"<br />个人介绍不能大于1000个字！<br /><br />",
                "lock":true,
                "showButtons":true,
                "cancelButton":false,
                "onComplete": function() {
                   elem.introduction.focus(); 
                },
                "onReady": function() {
                    $(".D_submit").focus();
                }
            });
            return false;
        }
        return true;
    };

    editor.event = function() {
        var elem = this._form,
            jobstate = elem.jobstate,
            that = this;
        // 选择不同求职状态
        $(jobstate).change(function() {
            that.setJobstate(this.value);
        });

        // 修改信息提交
        $(elem).submit(function() {
            if ( that.check() ) {
                that.editSubmit();
            }
            return false;
        });
    };

    /**
     * 求职状态变化后的处理
     */
    editor.setJobstate = function(state) {
        if ( state === "0" ) {
            $("#com-input, #students-input").hide();
            return false;
        }
        
        // 求职中、学生
        if ( state === "1" || state === "3" ) {
            $("#students-input").show();
            $("#com-input").hide();
        }
        // 已就业
        if ( state === "2" ) {
            $("#com-input").show();
            $("#students-input").hide();
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
        $.get("/tags/getaddtagslist?model=member&page="+page+"&pagesize="+pagesize+"&tags="+$("#js-hidden-tag").val(), function(data) {
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
                if ($("#js-newtag").val().indexOf("<") >= 0) {
                    alert("标签中含有非法字符！");
                    return false;
                }
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

    editor.init = function() {
        this.event();
        this.setJobstate(this._form.jobstate.value);
        // 初始化标签选择效果
        tags.init();
    };


    return editor;
});