$("#login").submit(function(){
    "use strict";
    var data = $(this).serialize();

    $.ajax({
        type:"post",
        data:data,
        url:$(this).attr("action"),
        success:function(json){
            alert(json.message);
            if(json.code === 1) {
                window.location = json.url;
            }
        }
    });

    return false;
});