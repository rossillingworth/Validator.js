
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
            var passesTest = ($(element).val());
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

            alert("validate children");

            return {form:"form has Errors"};
        },
        ajaxTest:function(element, args , errors, displayFunction){
            debugger;
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
            var errorStr = "This is the default error display handler:\nTo stop seeing this, set 'errorDisplay' in your config.\n\n";
            for(e in errors){
                errorStr += JS.STRING.format("test[%1]\n - fails with message[%2]\n",e,errors[e]);
            }
            alert(errorStr);
        },
        showElementErrors:function(element,errors){
            var $element = $(element);
            $element.parent().find(".errormessage").remove();
            for(e in errors){
                $(element).after("<p class='errormessage'>"+e+": " + errors[e] +"</p>");
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
            var args = JS.DOM.DATA.getElementData(element,ruleName,this.configAttributeName, false)
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
            rules =  secondCut.map(JS.ARRAY.MAP.recurseWith(JS.STRING.trim));
        }
        return rules;
    },

    validate:function(element, type){

        // var to only allow rules to run once, ie: when allowed == true
        var allowed = (allowed == undefined)?true:false;

        // get data-attr based rules
        var changeRules = this.parseRules(JS.DOM.DATA.getElementData(element,"changeRules",this.configAttributeName, false));
        var submitRules = this.parseRules(JS.DOM.DATA.getElementData(element,"submitRules",this.configAttributeName, false));
        var errorsDisplayFunc = JS.DOM.DATA.getElementData(element, "errorDisplay",this.configAttributeName, "alertError");

        // always run changeRules
        var errors = {};
        errors = this.runAllRules(element, changeRules, errors, errorsDisplayFunc);

        // run submit rules if needed
        if(type == "submit"){
            errors = _.extend(errors, this.runAllRules(element, submitRules, errors, errorsDisplayFunc));
        }

        // show errors
        this.display[errorsDisplayFunc](element,errors);

        // stop submit propagating
        return errors;
    },

    /**
     * Validation event handler
     * @param event
     * @return {*}
     */
    triggerValidation:function(event){
        var element = event.target;
        var type = event.data.type
        var errors = this.validate(element, type);
        return _.isEmpty(errors);
    }

}

// TODO: get config object rules first, as can then be overridden by tag attr?



// keyup could be useful for AJAX validation, eg: username exists?


jQuery(function($){
    var boundValidatorTrigger = _.bind(Validator.triggerValidation, Validator);
    $(document).on("submit.form.validation","form",{type:"submit"}, boundValidatorTrigger);
    $(document).on("blur.form.validation","input,textarea,select",{type:"change"},boundValidatorTrigger);
    $(document).on("change.form.element.validation","select,option",{type:"change"},boundValidatorTrigger);
});