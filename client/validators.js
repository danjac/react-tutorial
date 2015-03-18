import validator from 'validator';
import Immutable from 'immutable';


class ValidationResult {

    constructor() {
        this._errors = Immutable.Map();
        this._data = Immutable.Map();
    }

    setError(name, message) {
        if (message) {
            this._errors = this._errors.set(name, message);
        }
    }

    get ok() {
        return this._errors.isEmpty();
    }

    get errors() {
        return this._errors.toJS();
    }

    set errors(errors) {
        this._errors = Immutable.Map(errors);
    }

    setData(name, value) {
        this._data = this._data.set(name, value);
    }

    getData(name, value) {
        return this._data.get(name);
    }

    get data() {
        return this._data.toJS();
    }

    set data(data) {
        this._data = Immutable.Map(data);
    }

}

class Validator {
    constructor() {
        this._validators = Immutable.List();
        this.async = false;
    }

    check(data) {
        // skip all async validators
        // return fields as plain JS obj

        let result = new ValidationResult();

        const validators = this._validators.filter((v) => !v.async);

        validators.forEach((v) => {
            let input = data[v.name];
            if (v.trim) input = validator.trim(input);
            v.fn(input, 
                 (value) => result.setData(v.name, value),             
                 (error) => result.setError(v.name, error));
        });
        return result;
    }

    checkAsync(data) {

        let result = this.check(data); // sync check first

        const validators = this._validators.filter((v) => v.async);

        const promises = validators.map((v) => {
            let input = data[v.name];
            if (v.trim) input = validator.trim(input);
            return v.fn(input, 
                        (value) => result.setData(v.name, value),
                        (error) => result.setError(v.name, error));
        }).toJS();

        return Promise.all(promises).then((values) => {
            return result;
        });
    }

    validate(name, fn, async=false, trim=true) {
        const validator = {
            name: name,
            fn: fn,
            async: async,
            trim: trim
        }
        this._validators = this._validators.push(validator);
        if (validator.async) {
            this.async = true;
        }
    }

}

export class Signup extends Validator {

    constructor() {

        super();

        this.validate("name", (value, accept, reject) => {
            if (!validator.isLength(value, 10, 60)) {
                return reject("Your name must be between 10 and 60 characters");
            } 
            accept(value);
        });

        this.validate("email", (value, accept, reject) => {
            if (!validator.isEmail(value)) {
                return reject("Please enter a valid email address");
            }
            accept(value);
        });

        this.validate("password", (value, accept, reject) => {
            if (!validator.isLength(value, 6)) {
                return reject("Your password must be at least 6 characters long");
            } 
            accept(value);
        });

    }

}

export class NewPost extends Validator {

    constructor() {

        super();

        this.validate("title", (value, accept, reject) => {
            if (!validator.isLength(value, 10, 200)){
                return reject("Title of your post must be between 10 and 200 characters");
            } 
            accept(value);
        });


        this.validate("url", (value, accept, reject) => {
            if (!validator.isURL(value)) {
                return reject("You must provide a valid URL");
            } 
            accept(value);
        });
    }
};
