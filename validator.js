// <input data-changeRules="required email minLength validateParents" data-minLength="3" data-required="3" data-email="@camelot,73,'a lot of text'">
// <input data-validator-config="myObj.myConfig.configObjectName">

//var myObj.myConfig.configObjectName = {
//    changeRules:"required email minLength",
//    submitRules:"",
//    email:"@camelot,73,'a lot of text'",
//    minLength:"3",
//    sendMessage:""
//    sendMessage:function(){}
//};



/**
 * go through a list of arguments, return the first one that validates
 * eval functions if are functions
 */
function ifAgain(){
    var args = Array.prototype.slice.call(arguments);
}


var Validator = {

    debug:true,

    configAttributeName:"validator-config",

    StopValidationException:function(message){
        this.message = message;
        this.name = "StopValidationException";
    },

    regex:{
        email:{
            pattern:/^([\w]+)(.[\w]+)*@([\w]+)(.[\w]{2,3}){1,2}$/,
            message:"not a valid email address"
        },
        ddmmyyyy:{
            pattern:/^([0-9]){2}(\/|-){1}([0-9]){2}(\/|-){1}([0-9]){4}$/,
            message:"date must must be ddmmyyyy"
        }
    },
    messages:{
        form:"Please fix the errors in the form.",
        test:"this is a test error",
        required:"this field is required",
        minLength:"must be longer than %1"
    },
    rules:{
        testDebug:function(element, args, errors, displayFunction){
            debugger;
            return {};
        },
        testError:function(element, args, errors, displayFunction){
            return {testError:Validator.messages.test};
        },
        showErrors:function(element, args, errors, displayFunction){
            return {showErrors:"" + errors.toString()};
        },
        required:function(element, args, errors, displayFunction){
            var passesTest = ($(element).val());
            return (passesTest)?{}:{required:Validator.messages.required};
        },
        notRequired:function(element, args, errors, displayFunction){
            var $element = $(element);
            if($element.val().length == 0){
                throw new Validator.StopValidationException("condition failed");
            }
            return {};
        },
        minLength:function(element, args, errors, displayFunction){
            var len = args[0] || 1;
            var passes = ($(element).val()).length > len;
            return passes?{}:{minLength:JS.STRING.format(Validator.messages.minLength,len)};
        },
        validateParents:function(element, args , errors, displayFunction){
            //
        },
        validateChildren:function(element, args , errors, displayFunction){

            console.log("validating children");
            var children = JS.DOM.FORM.getFormElements(element);
            children = children.filter(JS.DOM.isVisible);
            // iterate children
            _.each(children,function(child){
                errors = _.extend(errors,Validator.validate(child));
            });

            if(!_.isEmpty(errors)){
                for(n in errors){
                    delete(errors[n]);
                }
                errors = _.extend(errors,JS.OBJECT.createFromArgPairs("form",Validator.messages.form));
            }

            return errors;
        },
        ajaxTest:function(element, args , errors, displayFunction){
            setTimeout(function(){
                errors["addedAjax"] = "added an ajax call";
                Validator.display[displayFunction].call(this,element,errors);
            }, 2000);
        },
        conditionalTest:function(element, args , errors, displayFunction){
            var $element = $(element);
            if($element.val() == 1){
                throw new Validator.StopValidationException("condition failed");
            }
            return {};
        }
    },
    display:{
        alertError:function(element,errors){
            if(!_.isEmpty(errors)){
                var errorStr = [
                    "This is the default error display handler:",
                    JS.STRING.format("triggered by element[%1]with name[%2]",element.id,element.name),
                    "To stop seeing this, set the 'errorDisplay' property in your config.",
                    "A console log has been generated showing the element that caused this."
                ].join("\n");
                console.log("alertError displayed for:", element);
                for(e in errors){
                    errorStr += JS.STRING.format("test[%1]\n - fails with message[%2]\n",e,errors[e]);
                }
                alert(errorStr);
            }
        },
        setClass:function(element,errors,args){
            // setup
            debugger;
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

        show_Camelot_Error:function(element, errors){
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
    },

    runRegex:function(element, regexRuleName){
        var value = $(element).val();
        var regexRule = this.regex[regexRuleName];
        var parses = regexRule.pattern.test(value);
        var errorObj = {};
        errorObj[regexRuleName] = regexRule.message;
        return parses?{}:errorObj;
    },

    /**
     *
     * @param ruleName
     * @param element
     * @return {*}
     */
    runRule:function(element, ruleName, errors, displayFunction){
        if(this.regex[ruleName]){
            return this.runRegex(element, ruleName);
        }else{
            var rule = (_.isFunction(ruleName))?ruleName:JS.OBJECT.getProperty(this.rules,ruleName);
            if(!rule){
                throw new Error("Rule is undefined: " + ruleName);
            }
            var args = JS.DOM.DATA.getElementData(element,ruleName,this.configAttributeName, false);
            return rule(element, args, errors, displayFunction);
        }
    },

    /**
     * Run all element rules
     * @param element
     * @param rules
     * @return [errors]
     */
    runAllRules:function(element, rules, errors, displayFunction,continueOnError){
        continueOnError = continueOnError || false;

        try{
            for(num in rules){
                var rule = rules[num];

                if(!_.isEmpty(errors) && !continueOnError){
                    return errors;
                }

                if(rule instanceof Array){
                    errors = _.extend(errors, this.runAllRules(element, rule, errors, displayFunction, true));
                }else{
                    errors = _.extend(errors, this.runRule(element, rule, errors, displayFunction));
                }

                if(!_.isEmpty(errors) && !continueOnError){
                    return errors;
                }

            }
        }catch(e){
            // a StopValidationException allows conditions to stop all other validations
            if(e.name != "StopValidationException"){
                throw e;
            }
        }

        return errors;
    },

    runDisplay:function(element, displayName, errors){
        var displayFunc = (_.isFunction(displayName))?displayName:JS.OBJECT.getProperty(this.display,displayName);
        if(!displayFunc){
            throw new Error("Unknown Display Function: " + displayName);
        }
        var args = JS.DOM.DATA.getElementData(element,displayName,this.configAttributeName, false);
        return displayFunc(element, errors, args);
    },

    /**
     * run all the error displays specified for the element
     * @param element
     * @param errors
     * @param displays
     */
    runAllDisplays:function(element,displays,errors){
        // iterate over displays
        for(num in displays){
            var displayName = displays[num];
            this.runDisplay(element,displayName,errors);
        }
    },


    /**
     * parse validation rules
     * comma seperated means stop on failure
     * ampesand separated means continue on failure
     * eg: "required,email,minlength" or "required , email & minlength"
     *
     * @param rules
     * @return {*}
     */
    parseRules:function(rules){
        if(_.isString(rules)){
            var firstCut = (rules)?rules.split(","):[];
            var secondCut = _.map(firstCut,function(data){return data.indexOf("&") > -1?data.split("&"):data;});
            rules = _.map(secondCut,JS.ARRAY.recursiveFunctionCallGenerator(JS.STRING.trim, _.map));
        }
        return rules;
    },

    /**
     * Parse display string from the config to an array
     * while allowing a config-object to specify an array directly,
     * eg: an array of functions
     *
     * @param displays
     * @return {*}
     */
    parseDisplay:function(displays){
        if(_.isString(displays)){
            var firstCut = (displays)?displays.split(","):[];
            displays = _.map(firstCut,JS.ARRAY.recursiveFunctionCallGenerator(JS.STRING.trim, _.map));
        }
        return displays;
    },

    validate:function(element){

        // var to only allow rules to run once, ie: when allowed == true
        var allowed = (allowed == undefined)?true:false;

        // get data-attr based rules
        var rules = this.parseRules(JS.DOM.DATA.getElementData(element,"rules",this.configAttributeName, false));
        var displays = this.parseDisplay(JS.DOM.DATA.getElementData(element, "errorDisplay",this.configAttributeName, "alertError"));

        // run rules
        var errors = {};
        errors = this.runAllRules(element, rules, errors, displays);

        // display result: ie: valid or errors
        this.runAllDisplays(element,displays,errors);

        // stop submit propagating
        return errors;
    },

    /**
     * Validation event handler
     * @param event
     * @return {*}
     */
    triggerValidation:function(event){
        try{
            var element = event.target;
            var errors = this.validate(element);
            return _.isEmpty(errors);
        }catch(e){
            // this will catch and stop the form from submitting if there are errors
            if(Validator.debug && confirm("validation error","Do you want to debug now?\n ie: before the form submits?")){
                debugger;
                return false;
            }
            throw e;
        }
    }

}

// TODO: get config object rules first, as can then be overridden by tag attr?



// keyup could be useful for AJAX validation, eg: username exists?




