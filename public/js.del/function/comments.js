$("#smiley ul li").click(function(){
    "use strict";
    var smiley = $(this).children("img").attr("alt");

    //For IE PlaceHolder
    var defaultval = $("#comment").attr("placeholder");
    var thevalue   = $("#comment").val();
    if (defaultval === thevalue){
        $("#comment").val("").css({"color":"#000"});
    }
    grin(smiley);
});

function grin(tag) {
    "use strict";
    var myField,
        sel;
    tag = ' ' + tag + ' ';
    if (document.getElementById('comment') && document.getElementById('comment').type === 'textarea') {
        myField = document.getElementById('comment');
    } else {
        return false;
    }
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = tag;
        myField.focus();
    }else if (myField.selectionStart || myField.selectionStart === '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        var cursorPos = endPos;
        myField.value = myField.value.substring(0, startPos) + tag + myField.value.substring(endPos, myField.value.length);
        cursorPos += tag.length;
        myField.focus();
        myField.selectionStart = cursorPos;
        myField.selectionEnd = cursorPos;
    }else {
        myField.value += tag;
        myField.focus();
    }
}


var socket = io.connect('http://localhost:3000');

$("#commentform").submit(function(){
    "use strict";
    var tmp = {
        type     : "thread",
        threadId : $("#comment_post_ID").val(),
        author   : $("#author").val().trim() || "测试用户",
        email    : $("#email").val().trim() || "io@eq.gs",
        url      : $("#url").val().trim() || "http://eq.gs",
        content  : $("#comment").val().trim(),
        userId   : $("#author").val().trim() || null,
        parentId : $("#author").val().trim() || null
    };
    socket.emit("comment",tmp);
    return false;
});

socket.on('comment', function (msg) {
    "use strict";
    var threadId  = $("#comment_post_ID").val();
    if(msg.threadId === threadId){
        $("ul.commentlist").append(msg.content);
    }
});
