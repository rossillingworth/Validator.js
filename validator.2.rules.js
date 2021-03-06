

_.extend(Validator.rules,{

    debug:function(element, args, errors, displayFunction){
        debugger;
        return {};
    },
    testError:function(element, args, errors, displayFunction){
        return {testError:Validator.messages.test};
    },
    /**
     * Validate all the elements in a form
     * used when form submit is triggered
     * ie: add a as a rule to the form element
     *
     * @param element
     * @param args
     * @param errors
     * @param displayFunction
     * @return {*}
     */
    validateChildren:function(element, args , errors, displayFunction){
        var children = JS.DOM.FORM.getFormElements(element);
        children = _.filter(children,JS.DOM.isVisible);
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
    /**
     * Cause another element to revalidate
     * args - a comma seperated list of element IDs
     * will not return any errors
     *
     * @param element
     * @param args
     * @param errors
     * @param displayFunction
     */
    reValidate:function(element, args , errors, displayFunction){
        var others = args.split(",");
        others = _.map(others,JS.STRING.trim);
        others = _.map(others,document.getElementById);

        _.each(others,function(otherElement){
            Validator.validate(otherElement);
        })
        return {};
    },
    /**
     * An example of what happens when the test is asynchronous
     * ie: you can make a server request and display response
     *
     * @param element
     * @param args
     * @param errors
     * @param displayFunction
     */
    ajaxTest:function(element, args , errors, displayFunction){
        setTimeout(function(){
            errors["addedAjax"] = "added an ajax call";
            Validator.display[displayFunction].call(this,element,errors);
        }, 2000);
    },
    /**
     * Add this to a form to disabled all invisible element
     * and stop them being submitted
     *
     * @param element
     * @param args
     * @param errors
     * @param displayFunction
     * @return {Object}
     */
    disableFormFieldsIfHidden:function(element, args , errors, displayFunction){
        JS.DOM.FORM.disableHiddenFormFields(element);
        return {};
    }
});