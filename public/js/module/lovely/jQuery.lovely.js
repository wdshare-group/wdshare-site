/*
 * isLovely a jQuery plugin that validate the form data
 * usage : $(selector).isLovely({})
 * params : config, an object literal like
 *
 * {
 *     fields : {
 *         “#id” : {
 *             required : true || false,
 *             message  : "Some Messages",
 *             arg      : "String" || Number || CallBack,
 *             test     : Validate CallBack
 *         }
 *
 *     },
 *     action : "click" || "blur" || "focus" || "change", when an event occurs
 * }
 *
 *
 *
 *
 *
 */

;
(function($){
    "use strict";

    $.fn.isLovely = function (config) {
        var $this     = $(this),
            error     = true,
        //errFields = [],
            item;


        var makeError = function(error) {
            return $('<span id="'+error.id.attr("id") + '_unLovely" class="unLovelyMessage">'+error.message+'</span>');
        };


        var showError = function(message, el) {
            var $errorMessageId = $("#"+el.attr("id")+'_unLovely'),
                errorEl;

            if($errorMessageId.length <= 0) {
                errorEl = makeError({"id":el, "message":message});
                el.addClass('unlovely').after(errorEl);
            }

            $errorMessageId.show();
            el.addClass('unlovely');
        };


        var process = function(opts, selector) {
            var $selector = $(selector),
                val       = $selector.val();

            if(opts.trim || $selector.attr("type") !== "password") {
                val = $.trim(val);
            }

            if($selector.attr("type") === "radio" || $selector.find("input").attr("type") === "radio" || $selector.attr("type") === "checkbox" || $selector.find("input").attr("type") === "checkbox") {
                val = 1;
            }


            if((opts.required && val === "") || !opts.test(val, opts.arg)) {
                //errFields.push($selector);
                showError(opts.message,$selector);
                return false;
            } else {
                return true;
            }
        };


        var addEvent = function(opts, selector) {
            var $selector = $(selector);

            $selector.bind(config.action||"blur",function() {
                process(opts, selector);
            });

            $selector.bind("click",function() {
                $selector.removeClass("unlovely");
                $("#"+$selector.attr("id")+'_unLovely').hide();
            });
        };


        var handleSubmit = function() {
            var error = false,
                item;

            for (item in config.fields) {
                if(!process(config.fields[item], item)) {
                    error = true;
                }
            }

            if(error) {
                return false;
            }
        };


        for (item in config.fields) {
            addEvent(config.fields[item], item);
        }


        $this.bind("submit", handleSubmit);

    };

    //$.fn.isLovely.method = {}
}(jQuery));
