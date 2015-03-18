import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import knex from 'knex';
import expressJwt from 'express-jwt';
import {expect} from 'chai';
import mockDB, {getTracker} from 'mock-knex';

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

//const db = knex.initialize(config.database);
const app = express();

app.use(reactify(jsxRoutes));

app.use(expressJwt({
    secret: process.env.SECRET_KEY,
    credentialsRequired: false,
    requestProperty: 'authToken'
}).unless({ path: ["/public"]}));


app.set('views', __dirname + '/../server/views');
app.set('view engine', 'ejs');

       
describe("GET /", () => {

    var db;

	beforeEach((done) => {

        mockDB.knex.use(knex);
        mockDB.knex.install('pg');
        db = knex({ client: 'pg' });
        routes(app, db);
        done();

	});

	afterEach((done) => {
        mockDB.knex.uninstall();
        done();
	});

	it('should render a list of posts', (done) => {

        let tracker = getTracker();

        tracker.on('query', (query) => {
            query.response([
                {
                    id: 1,
                    title: 'test',
                    url: 'http://',
                    author: 'test',
                    author_id: 1,
                    created_at: new Date()
                }
            ]);
        });

        request(app)	
            .get("/")
            .expect(200, done);

	});

});
