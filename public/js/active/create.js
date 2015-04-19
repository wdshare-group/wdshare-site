$(document).ready(function(){
    $('#create-submit').on('click',function(ev){
        ev.preventDefault();
        var formData = $('#create-form').serialize();
        $.ajax({
            method: "POST",
            url: "/active/updateControl/",
            data: formData,
            success:function( msg ) {
                console.log(msg);
            }
        })
    })
});