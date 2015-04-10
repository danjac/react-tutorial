import send from 'koa-send';
import {thumbnailPath} from '../utils/image';

export function* upload() {
    yield send(this, thumbnailPath(this.params.filename));
};

export function* logout() {
    this.logout();
    this.session = null;
    this.redirect("/");
}


export function* index ()  {
    yield this.render('index', { csrfToken: this.csrf });
};
