$(function(){
	var $inputs  = $('input[placeholder],textarea[placeholder]');
	var lengths = $inputs.length;
	for (var i=0;i<lengths ;i++ ){
		var $_this = $inputs.eq(i);
		var placeholder = $_this.attr("ie-placeholder");
		var thevalue = $_this.val();
		if (thevalue == ""){
			$_this.val(placeholder).css({"color":"#ADA9C6"});
		}
	}
	$inputs.focus(function(){
		var defaultval = $(this).attr("ie-placeholder");
		var thevalue = $(this).val();
		if (defaultval == thevalue){
			$(this).val("").css({"color":"#000"});
		}
	});
	$inputs.blur(function(){
		var defaultval = $(this).attr("ie-placeholder");
		var thevalue = $(this).val();
		if (thevalue == ""){
			$(this).val(defaultval).css({"color":"#ADA9C6"});
		}
	});
});