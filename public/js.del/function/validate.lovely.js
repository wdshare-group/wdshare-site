$("#login").isLovely({
    fields:{
        "#email" : {
            required : true,
            message  : "",
            arg      : function(){"use strict";return $("#email").val().trim();},
            test     : function(){"use strict";return arguments[1]().length>0 && /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/.test(arguments[0]);}

        },
        "#password" : {
            required : true,
            message  : "",
            arg      : 8,
            test     : function(){"use strict";return arguments[0]?true:false;}
        }
    },
    action : "blur"
});

$("#register").isLovely({
    fields:{
        "#email" : {
            required : true,
            message  : "",
            arg      : function(){"use strict";return $("#email").val().trim();},
            test     : function(){"use strict";return /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/.test(arguments[0]);}

        },
        "#password" : {
            required : true,
            message  : "",
            arg      : 8,
            test     : function(){"use strict";return arguments[0]?true:false;}
        },
        "#repassword" : {
            required : true,
            message  : "",
            arg      : function(){"use strict";$("#password").val().trim() == $("#repassword").val().trim();},
            test     : function(){"use strict";return arguments[0]?true:false;}
        }
    },
    action : "blur"
});