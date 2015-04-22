$(function(){
    "use strict";

    // 初始化编辑器
    try {
        var editor = new Simditor({
            textarea:$("#body"),
            markdown: true,
            placeholder:"哈，来写点东西吧！"
        });
    } catch (error){}

    // 选择话题分类
    $("#category").val($(".current").attr("data-category"));
    $("#categoryId").val($(".current").attr("data-categoryId"));

    $("#navigation ul").on("click",function(e){
        var target     = $(e.target),
            category   = target.attr("data-category"),
            categoryId = target.attr("data-categoryId");

        if(target[0].nodeName.toLowerCase() === "a"){
            $("#category").val(category);
            $("#categoryId").val(categoryId);
            $(this).find(".current").removeClass("current");
            target.addClass("current");
        }
        return false;
    });

   // 提交新文章
    $("#ThreadnewForm").submit(function(){
        var url = $(this).attr("action"),
            i   = 0,
            thread;

        //bodies.val(bodies.editable("getHTML")[0]);

        /*thread = $(this).serializeArray();

        for(i<thread.length;i++;){
            console.log(thread[i].name);
            if(!thread[i].value || thread[i].value === '<p></p>'){
                //alert()
                switch (thread[i].name){
                    case "title":
                        alert("标题不可以为空！");
                        return false;
                    case "body":
                        alert("内容不可以为空！");
                        return false;
                    case "category":
                        alert("分类不可以为空！");
                        return false;
                }
            }
        }*/

        thread = $(this).serialize();

        if(!$("#category").val().trim()){
            alert("没有话题分类，不要调皮哦！");
            return false;
        }

        if(!$("#title").val().trim()){
            alert("没有话题的标题，不要调皮哦！");
            return false;
        }

        if(!$("#body").val().trim() || $("#body").val().trim() === '<p><br></p>'){
            alert("没有话题内容，不要调皮哦！");
            return false;
        }

        $.ajax({
            url:url,
            type:"post",
            data:thread,
            success:function(res){
                if(res && res.status === 200){
                    //alert(res.message);
                    window.location = '/thread/'+res.id
                }else{
                    alert(res && res.message);
                }

            }
        });

        return false;
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