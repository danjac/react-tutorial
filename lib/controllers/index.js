import React from 'react';
import Router from 'react-router';
import send from 'koa-send';
import {thumbnailPath} from '../utils/image';
import Routes from '../../app/Routes';
import UserStore from '../../app/stores/UserStore';

export function* upload() {
    yield send(this, thumbnailPath(this.params.filename));
}

export function* logout() {
    this.logout();
    this.session = null;
    this.redirect("/");
}

const render = function() {

    return new Promise((resolve, reject) => {
        const router = Router.create({
            routes: Routes,
            location: this.url,
            onAbort: (reason, location) => {
                const err = new Error();
                err.status = 302;
                err.location = "/login?next=" + encodeURI(this.url);
                reject(err);
            }
        });

        router.run((Handler, state) => {
            resolve(React.renderToString(<Handler />));
        });
    });
};

export function* index () {

    const appjs = this.app.env === 'development'? 'http://localhost:8080/js/app.js' : '/js/app.js';
    const user = this.passport.user || null;

    UserStore.updateUser(user);

    const component = yield render.call(this);

    yield this.render('index', {
        component: component,
        csrfToken: this.csrf,
        appjs: appjs,
        user: JSON.stringify(user)
    });
}
