import express from 'express';
import * as api from '../src/controllers/api';
import * as secure from '../src/controllers/secure';
import {index, upload, logout} from '../src/controllers';

export default function(app) {

    app
    .use('/api', express.Router()
        .get("/posts/", api.getAll)
        .post("/login/", api.login)
        .post("/signup/", api.signup)
        .get("/search/", api.search)
        .get("/user/:name", api.getUser)
        .get("/isname", api.nameExists)
        .get("/isemail", api.emailExists));

    app
    .use('/api/auth', express.Router()
        .use(secure.isSecure)
        .post("/submit/", secure.submit)
        .delete("/:id", secure.deletePost)
        .put("/upvote/:id", secure.upvote)
        .put("/downvote/:id", secure.downvote));

    app
    .get("/logout/", logout)
    .get('/uploads/:filename', upload)
    .get('/user/:user', index)
    .get('/:path', index)
    .get('/', index);

};
