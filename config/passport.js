import LocalStrategy from 'passport-local';
import passport from 'koa-passport';
import models from '../lib/models';

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
        usernameField: 'identity'
    },
    (identity, password, done) => {
        models.User.authenticate(identity, password)
        .then((user) => {
            done(null, user || false);
        });
    }));

};
