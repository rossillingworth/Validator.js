

_.extend(Validator.display,{

    setClass:function(element,errors,args){
        // setup
        var $element = $(element);
        args = args || "valid,error";
        args = args.split(",");
        // remove all currently displayed errors
        var $parent = $element.parent();
        $parent.removeClass(args.join(" "));
        // if got any errors, show errors
        if(_.isEmpty(errors)){
            $parent.addClass(args[0]);
        }else{
            $parent.addClass(args[1]);
        }
    },
    /**
     * Show field errors/valid in field container
     * @param element
     * @param errors
     */
    showErrorsInParentElement:function(element,errors){
        // setup
        var $element = $(element);
        var $parent = $element.parent();
        // remove all currently displayed errors
        $parent.removeClass("error valid");
        $parent.find(".errorMessage").remove();
        // if got any errors, show errors
        if(!_.isEmpty(errors)){
            _.each(errors,function(error){
                JS.DOM.createElement("p",{className:"errorMessage",innerHTML:error},$parent.get(0));
            });
            $parent.addClass("error");
        }else{
            $parent.addClass("valid");
        }
    },
    /**
     * Look for an error container for the form
     * Push form error message into container
     * @param element
     * @param errors
     */
    showFormErrorsInContainer:function(element,errors){
        // setup
        var $form = $(element);
        var $container = $form.find(".errorContainer");
        // remove all currently displayed errors
        $form.removeClass("formError");
        $form.find(".formErrorMessage").remove();
        // if got any errors, show errors
        if(!_.isEmpty(errors)){
            _.each(errors,function(error){
                var errorMsgEl = JS.DOM.createElement("p",{className:"formErrorMessage",innerHTML:error});
                $container.append(errorMsgEl);
            });
            $form.addClass("formError");
        }
    },

    show_valid_or_Error:function(element, errors){
        var $element = $(element);
        var $item = $element.closest(".item");
        $item.removeClass("error").removeClass("valid");
        if(_.isEmpty(errors)){
            $item.addClass("valid");
        }else{
            $item.addClass("error");
            var $msgContainer = $item.find(".msg");
            for(e in errors){
                $msgContainer.append("<p class='errormessage'>"+e+": " + errors[e] +"</p>");
            }
        }
    }

});