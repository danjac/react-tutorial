import validator from 'validator';

const validateName = (name) => {
    return new Promise((resolve, reject) => {
        if (!validator.isLength(name, 10, 60)) {
            return resolve("Your name must be between 10 and 60 characters");
        } 
        nameExists(name).then((exists) => {
            if (exists) {
                return resolve("This name has already been selected");
            }
            return resolve(null);
        });
    });
};

const validateEmail = (email) => {
    return new Promise((resolve, reject) => {
        if (!validator.isEmail(email)) {
            return resolve("Please enter a valid email address");
        } 
        emailExists(email).then((exists) => {
            if (exists) {
                return resolve("This email has already been selected");
            }
            return resolve(null);
        });
    });
};

export default {

    signup(name, email, password, nameExists, emailExists) {
        var errors = {};
        
        return new Promise((resolve, reject) => {

            var errors = {};
            validateName(name).then((error) => {
                if (error) {
                    errors.name = error;
                }
            }).then(() => {
                return validateEmail(email);
            }).then((error) => {
                if (error) {
                    errors.email = error;
                }
            }).then(() => {
                if (!validator.isLength(password, 6)) {
                    errors.password ="Your password must be at least 6 characters long";
                }
                resolve(errors);
            });
        });
    },

    newPost(title, url) {
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
