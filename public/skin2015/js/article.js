define(['jquery', 'dialog'], function($) {
    /**
     * 初始化分享
     * @return
     */
    function share() {
        // 文章相关
        if ( $(".shareto").length > 0 ) {
            // 百度分享初始化
            window._bd_share_config={"common":{"bdSnsKey":{},"bdText":"【"+$(".article-title").html()+"】"+$("#js-description").html()+" 详文链接：","bdMini":"2","bdMiniList":false,"bdPic":"","bdStyle":"0","bdSize":"24"},"share":{}};with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)];
        }
    };

    /**
     * 注册点赞功能
     * @return
     */
    function zan() {
        var id = $("#js-archives-id").val(),
            c = 0;
        $(".article-top-zan, .article-like").click(function() {
            if ( c >= 5 ) {
                Dialog("点赞啪啪啪，很过瘾吧！歇会儿");
                return false;
            }
            $.get("/article/setzan/" + id, function(data) {
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
            return false;
        });

        function setzan() {
            var count = parseInt($(".article-top-zan em").html()) + 1;
            $(".article-top-zan em").html(count);
            $(".article-like em").html(count);
            c++;
        };
    };


    /**
     * 获取坐标
     * @return
     */
    function getCoordinates(address, callback) {
        var url = "http://api.map.baidu.com/geocoder/v2/?address="+ address +"&output=json&ak=itKN9P1RTdIUPVclW7LCLD4F&callback=?",
            count = 12;
        $.getJSON(url, function(data) {
            if ( !data ) { return false };
            if ( typeof data == "string" ) {
                data = $.parseJSON(data);
            }

            if ( data.status != 0 ) {
                $("#map").hide();
                $("#js-address-name").html(address);
                $("#js-coordinates-lng").html("");
                $("#js-coordinates-lat").html("");
                alert(data.msg);
                return false;
            }
            
            $("#js-address-name").html(address);
            $("#js-coordinates-lng").html(data.result.location.lng);
            $("#js-coordinates-lat").html(data.result.location.lat);

            $("#map").show();

            if ( address.length >= 8 ) {
                count = 15;
            }
            if ( callback ) {
                callback(data.result.location.lng, data.result.location.lat, data.result.confidence);
            }
        })
    };

    /**
     * 招聘终极页设置地图
     
    function jobEndMap() {
        if ( !document.getElementById("js-job-address") || !document.getElementById("js-job-address-map") ) { return false };
        getCoordinates($("#js-job-address").html(), function(lnt, lat, zoom) {
            var zoom = zoom || 12;
            $("#js-job-address-map").html('<iframe src="/static/ueditor/dialogs/map/show.html#center='+lnt+','+lat+'&zoom='+zoom+'&width=318&height=318&markers='+lnt+','+lat+'&markerStyles=l,A" frameborder="0" width="320" height="320"></iframe>');
        });
    };*/

    // 投递简历
    var SentResumes = {};
    SentResumes.init = function() {
        if ( !document.getElementById("js-sentResumes") ) {
            return false;
        }
        this.addevent();
    };
    SentResumes.addevent = function() {
        $("#js-sentResumes").click(function() {
            $.get("/user/get", function(data) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                }

                if ( data.code && data.code === 1 ) {// 成功
                    showDialog(data);
                } else {
                    if ( !data.member.username ) {
                        Dialog({
                            title: '投递简历',
                            msg: '<div class="D_alert">请先登录后再投递简历！</div>',
                            lock: true,
                            lockClose: false,
                            showButtons: true,
                            submitButton: '登录',
                            // cancelButton: false,
                            "onReady": function(that) {
                                $(that.content).find(".D_submit")[0].focus();
                            },
                            "onSubmit": function() {
                                window.location = '/user/login?referer='+ window.location.href;
                            }
                        });
                        return false;
                    }
                    if ( !data.info.sex ) {
                        Dialog({
                            title: '投递简历',
                            msg: '<div class="D_alert">您的帐号信息不完整，先完善信息后再投递简历！</div>',
                            lock: true,
                            lockClose: false,
                            showButtons: true,
                            submitButton: '完善信息',
                            // cancelButton: false,
                            "onReady": function(that) {
                                $(that.content).find(".D_submit")[0].focus();
                            },
                            "onSubmit": function() {
                                window.location = '/user/editInfo';
                            }
                        });
                        return false;
                    }
                }
                
            });
            return false;
        });

        function showDialog(data) {
            var _html = '',
                name = '',
                phone = '',
                github = 'http://',
                www = 'http://';
            if ( $(".but-reg").text() == "注册" ) {
                Dialog("请先登录！");
                return false;
            }

            if ( data.member.isActive ) {
                name = data.info.realname || data.member.username;
                phone = data.info.phone || '';
                github = data.info.github || 'http://';
                www = data.info.www || 'http://';
            }

            _html += '<div class="edit-body sentResumes-form">';
            _html += '<form id="js-sentResumes-form" name="sentResumes-form" method="post" action="">';
            _html += '<dl><dt>姓名：</dt><dd><input type="text" name="name" placeholder="请输入姓名" value="'+ name +'" class="in-text"></dd></dl>';
            _html += '<dl><dt>手机：</dt><dd><input type="text" name="phone" placeholder="请输入手机号码" value="'+ phone +'" class="in-text"></dd></dl>';
            _html += '<dl><dt>简历地址：</dt><dd><input type="text" name="resumes" placeholder="请输入简历地址" value="http://" class="in-text"><span>必须为网络可访问地址</span></dd></dl>';
            _html += '<dl><dt>工作经验：</dt><dd><select name="workingLife"><option value="" selected>请选择</option><option value="0">应届毕业</option><option value="1">1年</option><option value="2年">2年</option><option value="3年">3年</option><option value="4年">4年</option><option value="5年">5年</option><option value="6年">6年</option><option value="7年">7年</option><option value="8年">8年</option><option value="9年">9年</option><option value="10年以上">10年以上</option></select></dd></dl>';
            _html += '<dl><dt>学历：</dt><dd><select name="diploma"><option value="" selected>请选择</option><option value="无">无学历</option><option value="大专">大专</option><option value="本科">本科</option><option value="硕士研究生">硕士研究生</option><option value="博士">博士</option><option value="其他">其他</option></select></dd></dl>';
            _html += '<dl><dt>Github：</dt><dd><input type="text" name="github" placeholder="请输入Github地址" value="'+ github +'" class="in-text"></dd></dl>';
            _html += '<dl><dt>个人网站：</dt><dd><input type="text" name="www" placeholder="请输入个人网站地址" value="'+ www +'" class="in-text"><span>博客、微博等证明实力的网址</span></dd></dl>';
            _html += '<dl><dt>求职留言：</dt><dd><textarea name="content" placeholder="请输入500字以内的留言"></textarea></dd></dl>';
            _html += '<dl><dt>注意事项：</dt><dd>系统会自动将你在本站发布的文章、参加的活动、参与的评论等信息作为评审指标发送到面试官邮箱。</dd></dl>';
            _html += '<input type="submit" value="提交" style="display:none;" />';
            _html += '</form>';
            _html += '</div>';
            Dialog({
                id: 'js-sentResumes-dialog',
                title: '投递简历',
                msg: _html,
                lock: true,
                lockClose: false,
                showButtons: true,
                submitButton: '投递',
                // cancelButton: false,
                "onReady": function(that) {
                    var $form = $(that.content).find("form");
                    $form.submit(function() {
                        submitRequest(this);
                        return false;
                    });
                },
                "onSubmit": function(that) {
                    checkForm($(that.content).find("form")[0]);
                    return false;
                }
            });
        };

        function checkForm(_form) {
            if ( !_form.name.value ) {
                alert("没名字，面试官也不知道你是谁呀！");
                _form.name.select();
                return false;
            };
            if ( _form.name.value.length > 8 ) {
                alert("这个奇葩的名字太长了，认真点对待面试吧！");
                _form.name.select();
                return false;
            };
            if ( !_form.phone.value ) {
                alert("没有手机号我怕不能及时联系到你呀！");
                _form.phone.select();
                return false;
            };
            if ( _form.phone.value.length != 11 ) {
                alert("别骗我，这个手机号不正确！");
                _form.phone.select();
                return false;
            };
            if ( !_form.workingLife.value ) {
                alert("请选择工作经验！");
                _form.workingLife.focus();
                return false;
            };
            if ( !_form.diploma.value ) {
                alert("请选择学历！");
                _form.diploma.focus();
                return false;
            };
            
            if ( (!_form.github.value || _form.github.value == "http://") && (!_form.www.value || _form.www.value == "http://") ) {
                alert("你哪些证明实力的博客、网站、Github啥的都写点吧！");
                _form.github.select();
                return false;
            };
            if ( _form.content.value && _form.content.value.length > 500 ) {
                alert("求职留言太长了，hr都没时间看！");
                _form.phone.select();
                return false;
            };

            if ( !_form.resumes.value || _form.resumes.value == "http://" ) {
                Dialog({
                    title: '重要提示',
                    msg: '<div class="D_alert">确定不填写简历地址了？有简历更容易收到面试邀请。<br />你可以在博客、微博等网站发布一篇简历的文章来当作简历地址</div>',
                    lock: true,
                    lockClose: false,
                    showButtons: true,
                    submitButton: '继续提交',
                    cancelButton: '返回填写',
                    "onSubmit": function(that) {
                        submitRequest(_form);
                    }
                });
            } else {
                submitRequest(_form);
            };
        };

        function submitRequest(_form) {
            var jobID = $("#js-archives-id").val();
            Dialog({
                id: 'js-sentResumes-loading',
                title: '投递简历',
                msg: '<div class="D_alert">简历投递中...</div>',
                lock: true,
                lockClose: false,
                showButtons: false
            });
            $.post("/jobs/sentresumes?id="+jobID, $(_form).serialize(), function(data) {
                if ( !data ) { return false };
                if ( typeof data == "string" ) {
                    data = $.parseJSON(data);
                }
                Dialog.close("js-sentResumes-loading");
                if ( data.code && data.code === 1 ) {// 成功
                    Dialog.close("js-sentResumes-dialog");
                    Dialog({
                        title: '成功提示',
                        msg: '<div class="D_alert">'+ data.message +'</div>',
                        lock: true,
                        showButtons: true,
                        cancelButton: false,
                        "onReady": function(that) {
                            $(that.content).find(".D_submit")[0].focus();
                        },
                        "onComplete": function() {
                            window.location = '/user/myjobapply';
                        }
                    });
                } else {
                    Dialog({
                        title: '错误提示',
                        msg: '<div class="D_alert">'+ data.message +'</div>',
                        lock: true,
                        showButtons: true,
                        cancelButton: false,
                        "onReady": function(that) {
                            $(that.content).find(".D_submit")[0].focus();
                        }
                    });
                };
                return false;
            });
        };
    };

    var article = {};
    article.init = function() {
        share();
        zan();
        // jobEndMap();
        SentResumes.init();
    };

    return article;
});