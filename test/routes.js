import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import knex from 'knex';
import expressJwt from 'express-jwt';
import {expect} from 'chai';

import jsxRoutes from '../client/Routes';
import {reactify} from '../server/middleware';
import routes, {jwtToken} from '../server/routes';

dotenv.load();

const config = {

    database: {
	 	client: 'pg',
	    debug: false,
	    connection: {
	        user: process.env.DB_USER,
	        password: process.env.DB_PASSWORD,
	        database: "test_" + process.env.DB_NAME
	    }
    },

    directory: './migrations',
    tableName: 'knex_migrations'

};

const db = knex.initialize(config.database);

const deleteAll = () => {
    let deletes = ["users", "posts"].map((table) => {
        return db(table).del();
    });
    return Promise.all(deletes);
};

const migrate = () => {
    return db.migrate.latest(config);
};

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

routes(app, db);

describe("POST /api/submit", function() {

    this.timeout(0);

    before((done) => {
        migrate().then(() => done());
    });

    beforeEach((done) => {
        deleteAll().then(() => done());
    });
    
    it('should not allow posting if user not authenticated', (done) => {
        request(app)	
            .post("/api/submit/")
            .expect(401, done);
	});

    it('should allow posting if legit user', (done) => {

        db("users")
			.returning("id")
			.insert({
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"})
		.then((ids) => {
            let userId = parseInt(ids[0]);
            return request(app)	
                .post("/api/submit/")
                .send({
                    title: 'testing a new post',
                    url: 'http://google.com'
                })
                .set('authToken', userId)
                .expect((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.author_id).to.equal(userId);
                    expect(res.body.title).to.equal("testing a new post");
                })
                .end(done);
        });
    });

});

describe("GET /api/posts/", function() {

    before((done) => {
        migrate().then(() => done());
    });

    beforeEach((done) => {

        deleteAll()
        .then(() => {
   		    return db("users")
			.returning("id")
			.insert({
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"});
		})
        .then((ids) => {
			const userId = ids[0];
			const inserts = [
				{
					title: 'test',
					url: 'http://test',
					user_id: userId
				}
			];
            db("posts").insert(inserts)
        })
        .then(() => done());
    });

	it('should render a list of posts by score', (done) => {

        request(app)	
            .get("/api/posts/")
            .expect(200, done);

	});

	it('should render a list of posts by id', (done) => {

        request(app)	
            .get("/api/posts/")
            .query({ orderBy: "id" })
            .expect(200, done);

    });

});
