$.fn.isLovely.method = {
    eq : function(){return arguments[0] === arguments[0]() ? true : false}
}

$("#typeform").isLovely({
    fields:{
        "#enterprisename" : {
            required : true,
            message  : "Please Input The Name!",
            arg      : 7,
            test     : function(){;return arguments[0]?true:false}

        },
        "#password" : {
            required : true,
            message  : "Please Input The Password",
            arg      : function(){return $("#enterprisename").val()},
            test     : function(){;return arguments[0]?true:false}
        },
        "#sex" : {
            required : true,
            message  : "性别为必选项！",
            arg : function(){return $(".sex:checked").length},
            test : function(){return (arguments[1]()>0)?true:false }
        }
    },
    action : "blur"
});

$("#modifypassword").isLovely({
    fields:{
        "#opassword" : {
            required : true,
            message  : "Please Input The OPassword!",
            arg      : 7,
            test     : function(){return arguments[0]?true:false}

        },
        "#newpassword" : {
            required : true,
            message  : "Please Input The New Password",
            arg      : function(){return $("#opassword").val()},
            test     : function(){return (arguments[0] === arguments[1]()) ? true : false}
        }
    },
    action : "blur"
});



