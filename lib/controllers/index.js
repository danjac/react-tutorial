import send from 'koa-send';
import {thumbnailPath} from '../utils/image';

export function* upload() {
    yield send(this, thumbnailPath(this.params.filename));
}

export function* logout() {
    this.logout();
    this.session = null;
    this.redirect("/");
}


export function* index () {
    const appjs = this.app.env === 'development'? 'http://localhost:8080/js/app.js' : '/js/app.js';
    const user = this.passport.user || null;
    yield this.render('index', {
        csrfToken: this.csrf,
        appjs: appjs,
        user: JSON.stringify(user)
    });
}
