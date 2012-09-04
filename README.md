Validator.js
============

Validator.js is a **configuration and binding system for form validation**.
For each field specify the validation functions and provide arguments if required.
Validator handles everything else.

Our easily extended mixture of functions and regex is then used to validate your forms.
We provide a few basic examples, but you will need to add any custom functions.

Validation:

* basic validation rules
* REGEX validation rules
* cross field validation
* conditional validation
* add custom validation functions to extend rules

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
* simple error handling alerts developer to problems


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
