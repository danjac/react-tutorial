var validator = require('validator');

module.exports = {
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
