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


    var article = {};
    article.init = function() {
        share();
        zan();
    };

    return article;
});