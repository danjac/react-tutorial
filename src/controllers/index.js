import {thumbnailPath} from '../utils/image';
import {getPosts} from './api';

export function upload() {
    send(this, thumbnailPath(this.params.filename));
}

export function logout(req, res) {
    req.logout();
    res.redirect("/");
}


