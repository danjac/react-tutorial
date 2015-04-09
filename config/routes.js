import router from 'koa-router';
import mount from 'koa-mount';
import * as api from '../lib/controllers/api';
import * as secure from '../lib/controllers/secure';
import {index, upload} from '../lib/controllers';

export default (app) => {

    app.use(mount('/api/auth', new router()
        .post("/submit/", secure.submit)
        .post("/logout/", secure.logout)
        .delete("/:id", secure.deletePost)
        .put("/upvote/:id", secure.upvote)
        .put("/downvote/:id", secure.downvote)
        .get("/", secure.getUser)
        .use(secure.isSecure)
        .routes()));

    app.use(mount('/api', new router()
        .get("/posts/", api.getAll)
        .post("/login/", api.login)
        .post("/signup/", api.signup)
        .get("/search/", api.search)
        .get("/user/:name", api.getUser)
        .get("/isname", api.nameExists)
        .get("/isemail", api.emailExists)
        .routes()));

    app.use(mount('/', new router()
        .get('/uploads/:filename', upload)
        .get('/user/:user', index)
        .get('/:path', index)
        .get('/', index)
        .routes()));

};
