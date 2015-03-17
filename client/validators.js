import validator from 'validator';
import Immutable from 'immutable';


class ValidationFailure extends Error {

    constructor(validator) {
        this.status = 400; // for server-side
        this.errors = this.payload = validator.errors;
    }
}

class Validator {
    constructor() {
        this._errors = Immutable.Map();
        this._data = Immutable.Map();
        this._validators = Immutable.List();
    }

    reset() {
        this._errors = this._errors.clear();
        this._data = this._data.clear();
    }

    setError(name, message) {
        if (message) {
            this._errors = this._errors.set(name, message);
        }
    }

    hasError(name) {
        return this._errors.has(name);
    }

    isValid() {
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

    get data() {
        return this._data.toJS();
    }

    set data(data) {
        this._data = Immutable.Map(data);
    }

    check(data, throwsException=true) {
        // skip all async validators
        // return fields as plain JS obj

        this.data = data;

        const validators = this._validators.filter((v) => !v.async);

        validators.forEach((v) => {
            v.fn(this._data.get(v.name), 
                 (value) => this.setData(v.name, value),
                 (error) => this.setError(v.name, error));
        });

        if (!this.isValid() && throwsException){
            throw new ValidationFailure(this);
        }
        return this.data;
    }

    checkAsync(data, throwsException=true) {

        this.check(data, false); // sync check first, don't throw exception

        const validators = this._validators.filter((v) => v.async);

        const promises = validators.map((v) => {
            let value = this._data.get(v.name);
            return new Promise((resolve) => {
                v.fn(value, 
                     (value) => this.setData(v.name, value),
                     (error) => this.setError(v.name, error))
                    .then(() => {
                        resolve();
                    });
            })
        }).toJS();

        return Promise.all(promises).then(() => {
            if (!this.isValid() && throwsException) {
                throw new ValidationFailure(this);
            }
            return this.data;
        });
    }

    validate(name, fn, async) {
        const validator = {
            name: name,
            fn: fn,
            async: async
        }
        this._validators = this._validators.push(validator);
    }

    validateAsync(name, fn) {
        this.validate(name, fn, true);
    }

}

export class Signup extends Validator {

    constructor() {

        super();

        this.validate("name", (value, resolve, reject) => {
            value = (value || "").trim();
            if (!validator.isLength(value, 10, 60)) {
                reject("Your name must be between 10 and 60 characters");
            } else {
                resolve(value);
            }
        });

        this.validate("email", (value, resolve, reject) => {
            value = (value || "").trim();
            if (!validator.isEmail(value)) {
                reject("Please enter a valid email address");
            } else {
                resolve(value);
            }
        });

        this.validate("password", (value, resolve, reject) => {
            value = (value || "").trim();
            if (!validator.isLength(value, 6)) {
                reject("Your password must be at least 6 characters long");
            } else {
                resolve(value);
            }
        });

    }

}

export class NewPost extends Validator {

    constructor() {

        super();

        this.validate("title", (value, resolve, reject) => {
            value = (value || "").trim();
            if (!validator.isLength(value, 10, 200)){
                reject("Title of your post must be between 10 and 200 characters");
            } else {
                resolve(value);
            }
        });


        this.validate("url", (value, resolve, reject) => {
            value = (value || "").trim();
            if (!validator.isURL(value)) {
                reject("You must provide a valid URL");
            } else {
                resolve(value);
            }
        });
    }
};
