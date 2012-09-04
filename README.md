Validator.js
============

Validator.js is a **configuration and binding system for form validation**.
For each field specify the validation functions and provide arguments if required.
Validator handles everything else.

Our easily extended mixture of functions and regex is then used to validate your forms.
I am providing a few basic examples, but you will need to add any custom functions.

Validation:

* basic validation rules
* REGEX validation rules
* cross field validation
* conditional validation
* add custom validation functions to extend rules
* handles asynchronous AJAX functions as well (eg: isUsernameFree)

Error Display:

* error state highlighting
* error list display
* valid status display
* multiple display functions allowed per field
* add custom display functions to fit your HTML

Extras:

* configurable error messages
* customise everything from validation to display
* bind validations, so you can get more than 1 message, eg:required, minLength & noNumbers
* write adapter to parse server validation config on client
* simple error handling alerts developer to problems


Examples:
=

A Simple Form Validation
------------------------

This is a simple example, showing how easy it is to add Validator to your form.

```html
<form data-rules="validateChildren" data-errorDisplay="showFormErrors">
<!-- a required field, form submission will fail unless it is filled in -->
<input type="text" name="firstname" data-rules="required,noNumbers" data-errorDisplay="showFieldErrors">
<!-- this field is not required, but it will validate if it has content, if it fails, form will not submit -->
<input type="text" name="lastname" data-rules="notRequired,noNumbers" data-errorDisplay="showFieldErrors">
<!-- another required field, using a regex validation rule -->
<input type="text" name="email" data-rules="required,email" data-errorDisplay="showFieldErrors">
<input type="submit">
</form>
```

An advanced Form Validation
---------------------------

Using a config object, specify config in field attribute.

```javascript
var config = {
    form1:{
        form1:{
            rules:"validateChildren",
            errorDisplay:"showFormErrors"
        },
        firstname:{
            rules:"required,noNumbers",
            errorDisplay:"showFieldErrors"
        },
        lastname:{
            rules:"notRequired,noNumbers",
            errorDisplay:"showFieldErrors"
        }
        email:{
            rules:"required,email",
            errorDisplay:"showFieldErrors"
        }
    }
};
```

NB: notRequired is a conditional test, if the field has no value, then notRequired will stop any other validations
running, without causing an error to be displayed. You can write your own conditional tests to handle any
field or cross field tests you like. I have included examples of this to make it easier.

```html
<form data-validator-config="config.form1.form1">
<input type="text" name="firstname" data-validator-config="config.form1.firstname">
<input type="text" name="lastname" data-validator-config="config.form1.lastname">
<input type="text" name="email" data-validator-config="config.form1.email">
<input type="submit">
</form>
```



Custom validator functions
--------------------------

A simple minimum length function. Notice that an empty object ({}) is returned if it passes.

```javascript
Validator.rules.minLength = function(element, args, errors, displayFunction){
    var len = args[0] || 1;
    var passes = JS.DOM.FORM.getValue(element).length >= len;
    return passes?{}:{minLength:JS.STRING.format(Validator.messages.minLength,len)};
},
```


