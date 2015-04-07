import User from '../models/User';

export function* authenticate(next) {
    if (!this.authToken || !this.authToken.id) {
        this.throw(401, "No auth token provided");
    }
    this.state.user = yield User
        .findById(this.authToken.id)
        .exec();
    if (!this.state.user) {
        this.throw(401, "Invalid user ID");
    }
    yield next;
};


