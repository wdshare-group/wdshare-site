define(['jquery', 'dialog'], function($) {
    var editor = {};
    editor._form = document.getElementById("js-edit-form");

    editor.editSubmit = function() {
        var form = this._form,
            param = $(form).serialize(),
            that = this;
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
                    "time": 3000
                });
                if ( data.url ) {
                    window.location = data.url;
                }
            } else {// 保存失败
                Dialog({
                    "msg":"<br />"+ data.message +"<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false
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

    editor.init = function() {
        this.event();
        this.setJobstate(this._form.jobstate.value);
    };


    return editor;
});