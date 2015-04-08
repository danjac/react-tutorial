import LocalStrategy from 'passport-local';
import co from 'co';
import User from '../lib/models/User';

export default (passport) => {

    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser((id, done) => User.findById(id, done));

    passport.use(new LocalStrategy({
        usernameField: 'identity'
    },
    (identity, password, done) => {
        co(function *() {
            return yield User.authenticate(identity, password);
        })
        .then((user) => {
            done(null, user || false);
        });
    }));

}
