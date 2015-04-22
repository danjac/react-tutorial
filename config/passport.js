import LocalStrategy from 'passport-local';
import passport from 'passport';
import models from '../src/models';

export default function(app) {

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return models.User
        .findOne(id)
        .then((user) => {
            return done(null, user);
        });
    });

    passport.use(new LocalStrategy({
        usernameField: 'identity',
        passwordField: 'password',
        passReqToCallback: true
    },
    (req, identity, password, done) => {
        console.log("authenticating...", identity, password);
        models.User.authenticate(identity, password)
        .then((user) => {
            done(null, user || false);
        });
    }));

};
