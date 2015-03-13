import validator from 'validator';
import Immutable from 'immutable';

const validateName = (name, nameExists) => {
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

const validateEmail = (email, emailExists) => {
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

        return new Promise((resolve, reject) => {

            var errors = Immutable.Map();

            validateName(name, nameExists).then((error) => {
                if (error) {
                    errors = errors.set("name", error)
                }
            }).then(() => {
                return validateEmail(email, emailExists);
            }).then((error) => {
                if (error) {
                    errors = errors.set("email", error)
                }
            }).then(() => {
                if (!validator.isLength(password, 6)) {
                    errors = errors.set("password", "Your password must be at least 6 characters long");
                }
                resolve(errors);
            });
        });
    },

    newPost(title, url) {
        const errors = Immutable.Map();
        if (!validator.isLength(title, 10, 200)){
            errors.set("title", "Title of your post must be between 10 and 200 characters");
        }
        if (!validator.isURL(url)) {
            errors.set("url", "You must provide a valid URL");
        }
        return errors;
    }
};
