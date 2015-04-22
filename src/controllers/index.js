import {thumbnailPath} from '../utils/image';
import UserStore from '../../app/stores/UserStore';

export function upload() {
    send(this, thumbnailPath(this.params.filename));
}

export function logout(req, res) {
    req.logout();
    res.redirect("/");
}

export function index (req, res) {

    const appjs = process.env.NODE_ENV === 'development'? 'http://localhost:8080/js/app.js' : '/js/app.js';
    const user = req.user || null;

    // TBD: use a "bootstrap" function or per component thing
    UserStore.updateUser(user);
    req.reactify()
    .then((component) => {
        res.render('index', {
            component: component,
            csrfToken: req.csrfToken(),
            appjs: appjs,
            user: JSON.stringify(user)
        });
    });
}
