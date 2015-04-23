import express from 'express';
import * as api from '../src/controllers/api';
import * as secure from '../src/controllers/secure';
import {logout} from '../src/controllers';

export default function(app) {

    app
    .use('/auth', express.Router()
        .use(secure.isSecure)
        .get("/submit/", secure.submitPage)
        .post("/submit/", secure.submit)
        .delete("/:id", secure.deletePost)
        .put("/upvote/:id", secure.upvote)
        .put("/downvote/:id", secure.downvote))

    .get("/logout/", logout)
    .get("/posts/", api.getAll)
    .get("/login/", api.loginPage)
    .post("/login/", api.login)
    .post("/signup/", api.signup)
    .get("/search/", api.search)
    .get("/user/:name", api.getUser)
    .get("/isname", api.nameExists)
    .get("/isemail", api.emailExists)
    .get("/latest/",api.latest)
    .get("/", api.index);

};
