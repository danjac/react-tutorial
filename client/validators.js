import validator from 'validator';
import Immutable from 'immutable';

export default {

    signup(name, email, password) {

        var errors = Immutable.Map();

        if (!validator.isLength(name, 10, 60)) {
            errors = errors.set("name", "Your name must be between 10 and 60 characters");
        } 
        if (!validator.isEmail(email)){
            errors = errors.set("email", "Please enter a valid email address");
        }

        if (!validator.isLength(password, 6)) {
            errors = errors.set("password", "Your password must be at least 6 characters long");
        }

        return errors;

    },

    newPost(title, url) {
        var errors = Immutable.Map();
        if (!validator.isLength(title, 10, 200)){
            errors = errors.set("title", "Title of your post must be between 10 and 200 characters");
        }
        if (!validator.isURL(url)) {
            errors = errors.set("url", "You must provide a valid URL");
        }
        return errors;
    }
};
