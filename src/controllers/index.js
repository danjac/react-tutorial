import {thumbnailPath} from '../utils/image';
import UserStore from '../../app/stores/UserStore';

export function upload() {
    send(this, thumbnailPath(this.params.filename));
}

export function logout(req, res) {
    req.logout();
    this.session = null;
    res.redirect("/");
}

export function index (req, res) {
    console.log("howdy");
    res.send("OK");

    return;

    const appjs = process.env.NODE_ENV === 'development'? 'http://localhost:8080/js/app.js' : '/js/app.js';
    const user = req.user;

    // TBD: use a "bootstrap" function or per component thing
    UserStore.updateUser(user);
    req.reactify()
    .then((component) => {
        res.render('index', {
            component: component,
            csrfToken: req.csrf,
            appjs: appjs,
            user: JSON.stringify(user)
        });
    });
}
