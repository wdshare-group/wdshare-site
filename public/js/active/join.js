$(document).ready(function(){
    $('#join-submit').on('click',function(ev){
        ev.preventDefault();
        var formData = $('#joinform').serialize();
        $.ajax({
            method: "POST",
            url: "/active/joinControl/",
            data: formData,
            success:function( msg ) {
                console.log(msg);
            }
        })
    })
});