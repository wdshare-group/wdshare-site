define(['jquery', 'dialog'], function($) {
    
    // 子导航当前状态初始化
    function childNavInit() {
        if ( $(".myhome-nav-con").length < 1 ) { return false };
        var _lis = $(".myhome-nav-con a"),
            url = window.location.href;
        url = url.replace("http://", "");
        url = url.substring(url.indexOf("/"));

        _lis.each(function() {
            if ( $(this).attr("href") == url ) {
                $(this).addClass("current");
            }
        });
    };

    /**
     * 修改密码提交
     */
    function editPasswordSubmit() {
        if ( !document.getElementById("js-edit-password") ) { return false };
        var _form = document.getElementById("js-edit-password");
        $("#js-edit-password").submit(function() {
            if ( !_form.password.value ) {
                Dialog({
                    "msg":"<br />请输入您的旧密码！<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onComplete": function() {
                       _form.password.focus(); 
                    },
                    "onReady": function() {
                        $(".D_submit").focus();
                    }
                });
                return false;
            }
            if ( !_form.newPassword.value ) {
                Dialog({
                    "msg":"<br />请输入新密码！<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onComplete": function() {
                       _form.newPassword.focus(); 
                    },
                    "onReady": function() {
                        $(".D_submit").focus();
                    }
                });
                return false;
            }
            if ( !_form.reNewPassword.value ) {
                Dialog({
                    "msg":"<br />请确认新密码！<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onComplete": function() {
                       _form.reNewPassword.focus(); 
                    },
                    "onReady": function() {
                        $(".D_submit").focus();
                    }
                });
                return false;
            }
            if ( _form.newPassword.value != _form.reNewPassword.value ) {
                Dialog({
                    "msg":"<br />两次密码不一致！<br /><br />",
                    "lock":true,
                    "showButtons":true,
                    "cancelButton":false,
                    "onReady": function() {
                        $(".D_submit").focus();
                    }
                });
                return false;
            }

            // 提交新密码
            _form.submitbutton.value = "稍等...";
            _form.submitbutton.disabled = true;
            $.post("/user/editPassword", $(_form).serialize(), function(data) {
                var data;

                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                } else {
                    data = data;
                }

                _form.submitbutton.value = "修改";
                _form.submitbutton.disabled = false;

                if ( data.status == 200 && data.code && data.code == 1 ) {// 修改成功
                    Dialog({
                        "msg":"<br />修改成功，请重新登录！<br /><br />",
                        "lock":true,
                        "showButtons":true,
                        "cancelButton":false,
                        "onComplete": function() {
                           window.location = "/user/login";
                        },
                        "onReady": function() {
                            $(".D_submit").focus();
                        }
                    });
                } else {// 修改失败
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
            return false;
        });
        
    };

    /**
     * 根据性别设置网页风格
     */
    function setSex() {
        if ( sex && sex === 2 && $(".myhome-head").length > 0 ) {
            $(".myhome-head").addClass("myhome-head-girl");
        }
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
                        img1 = document.createElement("img")
                        img2 = document.createElement("img")
                        img3 = document.createElement("img");
                    reader.readAsDataURL(fileObj.files[i]);
                    reader.onload = function(e) {  
                        img.setAttribute("src", e.target.result);
                        img1.setAttribute("src", e.target.result);
                        img2.setAttribute("src", e.target.result);
                        img3.setAttribute("src", e.target.result);
                        img.className = "face-square-big";
                        img1.className = "face-round-big";
                        img2.className = "face-square-small";
                        img3.className = "face-round-small";
                        box.appendChild(img);
                        box.appendChild(img1);
                        box.appendChild(img2);
                        box.appendChild(img3);
                        if ($(img1).width() != $(img1).height()) {
                            Dialog({
                                "msg":"<br />您上传的图片不是正方形，可能被拉伸！<br /><br />",
                                "title": "头像上传",
                                "lock":true,
                                "lockClose": false,
                                "showButtons":true,
                                "submitButton": "继续上传",
                                "cancelButton": "重新选择",
                                "onCancel": function() {
                                   window.location.reload();
                                },
                                "onReady": function() {
                                    $(".D_submit").focus();
                                }
                            });
                        };
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
        xhr.open("POST", "/user/editFace");
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
            new Dialog({'msg':data.state, 'lock': true, 'lockClose':false, 'title':"图片上传结果", 'animation': 'BounceIn'});
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


    /**
     * 我的评论中的删除功能
     * @return
     */
    function delMyComment() {
        $(".user-comment-del").click(function() {
            removeComment(this);
            return false;
        });
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
                var parent = $(elem).parents(".user-comment-item").eq(0);
                parent.addClass("user-comment-del-note");
                parent.append('<div class="user-comment-del-note-text"><p>数据删除中...</p></div>');
                $.get(url, function(data) {
                    if ( !data ) { return false };
                    if ( typeof data == "string" ) {
                        data = $.parseJSON(data);
                    } else {
                        data = data;
                    };

                    if ( data.status == 200 && data.code && data.code == 1 ) {// 成功
                        parent.find(".user-comment-del-note-text p").html("删除成功！");
                        setTimeout(function() {
                            $(parent).animate({
                                opacity: 'hide',
                                height: 0
                            }, 500, function() {
                                $(parent).remove();
                            });
                        }, 2000);
                    } else {// 失败
                        parent.find(".user-comment-del-note-text p").html("删除失败，请刷新重试！");
                    }
                });
            };
        };
    };



    var myhome = {};
    myhome.init = function() {
        childNavInit();

        editPasswordSubmit();

        setSex();


        // 选择图片
        $("#js-upface-but").change(function() {
            PreviewImage(this);
        });

        // 点击上传
        $("#js-upface-submit a").click(function() {
            imagesUpLoad($("#js-upface-but")[0].files[0], function() {
                window.location.reload();
            });
            return false;
        });

        delMyComment();
    };


    return myhome;
});