define(['jquery', 'dialog'], function($) {
    function chackMail(str) {
        var re = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]*)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        return (re.test(str));
    };

    function addInit() {
        $('#js-company-info-form').submit(function() {
            var _form = this;
            
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
                url: "/jobs/companys",
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
                                    window.location = "/user/myjob";
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
    };



    /**
     * 标签选择效果
     * @return
     */
    var tags = {};
    tags.tagMax = 10;
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
        $.get("/tags/getaddtagslist?model=job&page="+page+"&pagesize="+pagesize+"&tags="+$("#js-hidden-tag").val(), function(data) {
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

    /**
     * 编辑企业Logo
     * @return
     */
    function showEditorLogo() {
        var _html = '';
        _html += '<div class="edit-body edit-comlogo">';
        _html += '  <div class="select-face-file-node">请选择宽高大于或等于 128px 的公司Logo</div>';
        _html += '  <div class="select-face-file" id="js-select-face-file">';
        _html += '    <span>选择图片</span>';
        _html += '    <input type="file" name="upfile" id="js-upface-but" />';
        _html += '  </div>';
        _html += '  <div class="upface-preview-loading" id="js-upface-preview-loading">正在生成预览图...</div>';
        _html += '  <div class="upface-preview" id="js-upface-preview"></div>';
        _html += '  <div class="upface-submit" id="js-upface-submit"><a href="#">上传Logo</a></div>';
        _html += '</div>';

        Dialog({
            id: "js-dialog-editlogo",
            title:"企业Logo上传",
            msg: _html,
            lock: true,
            onReady: function() {
                // 选择图片
                $("#js-upface-but").change(function() {
                    PreviewImage(this);
                });

                // 点击上传
                $("#js-upface-submit a").click(function() {
                    imagesUpLoad($("#js-upface-but")[0].files[0], function() {
                        $(document).scrollTop(0);
                        Dialog({
                            "msg":"<br />Logo 上传成功，可以发布招聘信息啦！<br /><br />",
                            "title":"企业Logo上传",
                            "lock":true,
                            "showButtons":true,
                            "cancelButton":false,
                            "onReady": function() {
                                $(".D_submit").focus();
                            },
                            "onComplete": function() {
                                window.location.reload();
                            }
                        });
                    });
                    return false;
                });
            }
        });
    };

    /**
     * 上传头像相关
     */
    //js本地图片预览
    function PreviewImage(fileObj) {
        if ( !fileObj.files || !window.FileReader ) {
            return error("该升级啦，请使用IE10+及现代化浏览器上传头像！");
        }

        if ( fileObj.files.length > 9 ) {
            return error("最多上传9张图片，请重新选择");
        }

        var allowExtention = ".jpg,.JPG,.jpeg,.JPEG,.bmp,.BMP,.gif,.GIF,.png.PNG";//允许上传文件的后缀名;  
        var extention = fileObj.value.substring(fileObj.value.lastIndexOf(".")+1).toLowerCase();
        var browserVersion = window.navigator.userAgent.toUpperCase();
        var box = document.getElementById("js-upface-preview");
        var errorNote = document.getElementById("js-upface-preview-loading");
        box.innerHTML = "";// 清空先前的预览内容

        errorNote.style.display = "block";

        // PC点取消时的操作
        if ( fileObj.files.length  == 0 ) {
            errorNote.style.display = "none";
            box.innerHTML = "";// 清空先前的预览内容
            return false;
        }
        
        if ( allowExtention.indexOf(extention) < 0 ) {
            return error("仅支持"+allowExtention+"为后缀名的文件!");
        };

        showPhoto();
        
        function showPhoto(files) {
            for ( var i=0,l=fileObj.files.length; i<l; i++ ) {
                (function() {
                    var reader = new FileReader(),
                        img = document.createElement("img"),
                        img2 = document.createElement("img");
                    reader.readAsDataURL(fileObj.files[i]);
                    reader.onload = function(e) {  
                        img.setAttribute("src", e.target.result);
                        img2.setAttribute("src", e.target.result);
                        img.className = "face-square-big";
                        img2.className = "face-square-small";
                        box.appendChild(img);
                        box.appendChild(img2);
                    }

                    // 完成预览时隐藏loading
                    if ( i == fileObj.files.length - 1 ) {
                        errorNote.style.display = "none";
                        document.getElementById("js-select-face-file").style.display = "none";
                        document.getElementById("js-upface-submit").style.display = "block";
                    }
                })(i);
                
            }
        };

        function error(str) {
            alert(str);
            fileObj.value="";//清空选中文件
            errorNote.style.display = "none";
            return false;
        }
    };

    function imagesUpLoad(file, callback) {
        new Dialog({'id':'js-upface-dialog', 'msg':'<div class="upload-progress" id="js-upload-progress"><div class="upload-progress-item"><h4><span>上传进度：</span><em class="percent">10%</em></h4><div class="schedule"><div class="filler" style="width:10%;"></div></div></div></div>', 'lock': true, 'lockClose':false, 'title':"图片上传中", 'animation': 'BounceIn'});
        new uploadFile(file, callback);
    };


    /**
     * 向服务器发起请求【单一文件发送】--现代浏览器
     * @param  {IMGElement} file 单一文件
     * @return
     */
    function uploadFile(file, callback) {
        var fd = new FormData(),
            xhr = new XMLHttpRequest(),
            that = this;
        this.callback = callback;

        // 设置上传文件的目录
        // fd.append('file-path', API.currentPath);
        // 向表单中添加上传文件
        fd.append("upfile", file);

        xhr.upload.addEventListener("progress", function(e){
            that.uploadProgress(e);
        }, false);
        xhr.addEventListener("load", function(e){
            that.uploadComplete(e);
        }, false);
        xhr.addEventListener("error", function(e){
            that.uploadFailed(e);
        }, false);
        xhr.addEventListener("abort", function(e){
            this.uploadCanceled(e);
        }, false);
        xhr.open("POST", "/user/editComlogo");
        xhr.send(fd);
    };
    // 上传进度
    uploadFile.prototype.uploadProgress = function (evt) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        $("#js-upload-progress").find(".percent").html(percentComplete.toString() + "%");
        $("#js-upload-progress").find(".filler").css("width", percentComplete.toString() + "%");
    };
    // 上传成功
    uploadFile.prototype.uploadComplete = function (evt) {
        var data = $.parseJSON(evt.target.responseText),
            that = this;

        if ( data.state != "SUCCESS" ) {// 报错
            Dialog.close("imageUpload-dialog");
            new Dialog({'msg':data.state, 'lock': true, 'lockClose':false, 'title':"图片上传结果", 'animation': 'BounceIn', 'showButtons':true, 'cancelButton':false, 'onSubmit':function() {
                window.location.reload();
            }});
        } else {// 成功处理
            $("#up-baby-photo").val(data.url);
            Dialog.close("imageUpload-dialog");
            if ( this.callback ) {
                this.callback();
            }
        }
        return false;
    };
    // 上传失败
    uploadFile.prototype.uploadFailed = function (evt) {
        Dialog.close("imageUpload-dialog");
        new Dialog({'msg':'文件上传失败！', 'lock': true, 'title':"图片上传结果", 'animation': 'BounceIn'});
    };
    // 上传过程取消或中断
    uploadFile.prototype.uploadCanceled = function (evt) {
        Dialog.close("imageUpload-dialog");
        new Dialog({'msg':'上传被取消或中断，请重新上传！', 'lock': true, 'title':"图片上传结果", 'animation': 'BounceIn'});
    };

    var companyInfo = {};
    companyInfo.init = function() {
        addInit();

        // 初始化标签选择效果
        tags.init();


        $("#js-editor-logo").click(function() {
            showEditorLogo();
            return false;
        });

        if ( document.getElementById("js-job-set-map") ) {
            require(["jobSetMap"]);
        }
    };

    return companyInfo;
});