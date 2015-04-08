import Strategy as LocalStrategy from 'passport-local';
import User from '../lib/models/User';

const serialize = (user, done) => {
    done(null, user._id);
};

const deserialize = (id, done) => {
    User.findById(id, done);
};

export function (passport) {

    passport.serializeUser(serialize);
    passport.deserializeUser(deserialize);
    passport.use(new LocalStrategy(User.authenticate));

}
