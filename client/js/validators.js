var validator = require('validator');

module.exports = {

    signup: function(name, email, password, nameExists, emailExists) {
        var errors = {};
        
        var validateName = function(name) {
            return new Promise(function(resolve, reject) {
                if (!validator.isLength(name, 10, 60)) {
                    return resolve("Your name must be between 10 and 60 characters");
                } 
                nameExists(name).then(function(exists) {
                    if (exists) {
                        return resolve("This name has already been selected");
                    }
                    return resolve(null);
                });
            });
        };

        var validateEmail = function(email) {
            return new Promise(function(resolve, reject) {
                if (!validator.isEmail(email)) {
                    return resolve("Please enter a valid email address");
                } 
                emailExists(email).then(function(exists) {
                    if (exists) {
                        return resolve("This email has already been selected");
                    }
                    return resolve(null);
                });
            });
        };

        return new Promise(function(resolve, reject) {

            var errors = {};
            validateName(name).then(function(error) {
                if (error) {
                    errors.name = error;
                }
            }).then(function() {
                return validateEmail(email);
            }).then(function(error) {
                if (error) {
                    errors.email = error;
                }
            }).then(function() {
                if (!validator.isLength(password, 6)) {
                    errors.password ="Your password must be at least 6 characters long";
                }
                resolve(errors);
            });
        });
    },

    newPost: function(title, url) {
        var errors = {};
        if (!validator.isLength(title, 10, 200)){
            errors.title = "Title of your post must be between 10 and 200 characters";
        }
        if (!validator.isURL(url)) {
            errors.url = "You must provide a valid URL";
        }
        return errors;
    }
};
