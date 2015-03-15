
export class ValidationFailure extends Error {
    constructor(errors) {
        this.status = 400;
        this.payload = errors;
    }
};

export class NotAuthenticated extends Error {
    constructor(message) {
        this.message = message;
        this.status = 401;
    }
};

export class NotAllowed extends Error {
    constructor(message) {
        this.message = message;
        this.status = 403;
    }
};

