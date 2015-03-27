import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import methodOverride from 'method-override';
import expressJwt from 'express-jwt';
import {expect} from 'chai';

import jsxRoutes from '../lib/frontend/Routes';
import routes, {jwtToken} from '../lib/routes';

dotenv.load();

const app = express();

app.use(bodyParser.json());
app.use(methodOverride());

// fake jwt
//
app.use((req, res, next) => {
    var userId = req.header('authToken');
    if (userId) {
        req.authToken = {id: userId};
    }
    next();
});

//app.set('views', __dirname + '/../server/views');
//app.set('view engine', 'ejs');
//app.use(reactify(jsxRoutes));

routes(app);

describe("DELETE /api/delete", () => {

    it('should return a 401 if no user is authenticated', (done) => {
        done();
    });

    it('should return a 404 if no post exists', (done) => {
        done();
    });

    it('should return a 404 if post does not belong to user', (done) => {

        done();
    });

    it('should delete the post if the post belongs to the user', (done) => {

        done();
    });


});


describe("GET /api/auth", () =>  {
    it('should return a 401 if no user is authenticated', (done) => {
        done();
    });

    it('should return a 401 if no valid user matches token', (done) => {
        done();
    });

    it('should return some JSON if valid user matches token', (done) => {
        done();
    });
    
});

describe("PUT /api/upvote", function() {
    it('should not allow upvote if not logged in', (done) => {
        done();
	});

    it('should not allow upvote if post does not exist', (done) => {

        done();
	});

    it('should allow upvote if post does not belong to user', (done) => {

        done();

	});

    it('should not allow upvote if post belongs to user', (done) => {

        done();

	});


    it('should not allow upvote if post if user has already voted', (done) => {

        done();

	});






});

describe("POST /api/submit", function() {

   
    it('should not allow posting if user not authenticated', (done) => {
        done();
	});

    it('should return errors if missing data', (done) => {
        done();
    });

    it('should allow posting if legit user', (done) => {
        done();
    });

});

describe("GET /api/posts/", function() {

	it('should render a list of posts by score', (done) => {
        done();
   	});

	it('should render a list of posts by id', (done) => {
        done();
    });

});
