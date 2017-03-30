define(['jquery', 'dialog'], function($) {
    function chackMail(str) {
        var re = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]*)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        return (re.test(str));
    };

    function addInit() {
        $('#js-job-create-form').submit(function() {
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

            if ( _form.code && !_form.code.value ) {
                alert("填写验证码后再提交！");
                _form.code.focus();
                return false;
            }

            // 设置地图坐标的隐藏表单值
            if ( typeof JobMapSetHiddenInput == "function" ) {
                JobMapSetHiddenInput();
            }

            if ( !_form.mapLng.value || !_form.mapLat.value || !_form.mapZoom.value ) {
                alert("地图信息不完整请选择地图坐标！");
                return false;
            }

            var formData = $(_form).serialize();
            $(_form).find("input[type='submit']").val("稍等...").attr("disabled", true);
            $.ajax({
                method: "POST",
                url: "/jobs/create",
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
                                window.location = "/user/myjob";
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
     * title更跟随分类变化
     * @return
     */
    function titleChange() {
        var _form = $('#js-job-create-form')[0];
        console.log(_form.aid.value);
        if ( !_form.aid.value ) {
            $(_form.channelId).change(function() {
                if ( !$(this).val() ) {// 为选择值设置为空
                    $(_form.title).val("");
                    return false;
                }
                // 选择分类后设置标题
                $(this).find("option").each(function() {
                    if ( this.selected ) {
                        $(_form.title).val($(this).text() + "工程师");
                    }
                });
            });
        }
    };
    

    var foo = {};
    foo.init = function() {
        addInit();

        titleChange();

        if ( document.getElementById("js-job-set-map") ) {
            require(["jobSetMap"]);
        }
    };

    return foo;
});