$(function(){
    "use strict";
    var isChanged = false;
    $("#updateEmail").submit(function(){
        var self = $(this),
            data = self.serialize();

        if(!isChanged){
            alert("请填写新邮箱之后再更新！");
            return false;
        }

        $.ajax({
            type:"post",
            data:data,
            url:$(this).attr("action"),
            success:function(json){
                self.append(json.message);
                if(json.code === 1) {
                    //window.location.href = "/";
                }
            }
        });

        return false;
    });

    $("#email").change(function(){
        isChanged = true;
        $("input[type=submit]").removeClass("disable").attr({"disable":false});
    });

    $("#activeAccount").click(function(){
        var href = "/activeAccount" || $(this).href;
        $.ajax({
            type:"get",
            url:href,
            success:function(res){
                if(res.status === 200 && res.code === 1){
                    alert(res.message);
                }else{
                    alert(res.message);
                }
            }
        });
        return false;
    });
});