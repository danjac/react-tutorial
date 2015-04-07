import router from 'koa-router';
import mount from 'koa-mount';
import index from '../lib/controllers';
import * as api from '../lib/controllers/api';
import * as auth from '../lib/controllers/auth';
import {authenticate} from '../lib/controllers/middleware';


export default (app) => {

    app.use(mount('/api/auth', new router()
        .post("/submit/", auth.submit)
        .delete("/:id", auth.deletePost)
        .put("/upvote/:id", auth.upvote)
        .put("/downvote/:id", auth.downvote)
        .get("/", auth.getUser)
        .use(authenticate)
        .routes()));

    app.use(mount('/api', new router()
        .get("/posts/", api.getAll)
        .post("/login/", api.login)
        .post("/signup/", api.signup)
        .get("/search/", api.search)
        .get("/user/:name", api.getUser)
        .routes()));

    app.use(mount('/', new router()
        .get('/user/:user', index)
        .get('/:path', index)
        .get('/', index)
        .routes()));

};
