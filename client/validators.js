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
            let [value, error] = v.fn(this._data.get(v.name), this);
            this.setData(v.name, value);
            this.setError(v.name, error);
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
                v.fn(value)
                    .then((result) => {
                        resolve([v.name, result]);
                    });
            })
        }).toJS();

        return Promise.all(promises).then((values) => {
            values.forEach((v) => {
                let [name, [value, error]] = v;
                this.setData(name, value);
                this.setError(name, error);
            });
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

        this.validate("name", (value) => {
            value = (value || "").trim();
            if (!validator.isLength(value, 10, 60)) {
                return [value, "Your name must be between 10 and 60 characters"];
            }
            return [value, null];
        });

        this.validate("email", (value) => {
            value = (value || "").trim();
            if (!validator.isEmail(value)) {
                return [value, "Please enter a valid email address"];
            }
            return [value, null];
        });

        this.validate("password", (value) => {
            value = (value || "").trim();
            if (!validator.isLength(value, 6)) {
                return [value, "Your password must be at least 6 characters long"];
            }
            return [value, null];
        });

    }

}

export class NewPost extends Validator {

    constructor() {

        super();

        this.validate("title", (value) => {
            value = (value || "").trim();
            if (!validator.isLength(value, 10, 200)){
                return [value, "Title of your post must be between 10 and 200 characters"];
            }
            return [value, null];
        });


        this.validate("url", (value) => {
            value = (value || "").trim();
            if (!validator.isURL(value)) {
                return [value, "You must provide a valid URL"];
            }
            return [value, null];
        });
    }
};
