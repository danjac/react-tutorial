import express from 'express';
import http from 'http';
import path from 'path';
import mongoose from 'mongoose';
import errorHandler from 'errorhandler';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import serveStatic from 'serve-static';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import dotenv from 'dotenv';
import cors from 'cors';
import _ from 'lodash';
import routes from './lib/routes';
import {reactify} from './lib/middleware';
import jsxRoutes from './lib/frontend/Routes';

dotenv.load();

const app = express();

// all environments

const port = process.env.PORT || 5000

app.set('port', port);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(serveStatic(path.join(__dirname, '/public')));

app.use(expressJwt({
    secret: process.env.SECRET_KEY,
    credentialsRequired: false,
    requestProperty: 'authToken'
}).unless({ path: ["/public"]}));


const devMode = 'development' == app.get('env');

// development only
if (devMode) {
    console.log("Using development environment");
    app.use(errorHandler());
}

// handle some promise rejections
process.on('unhandledRejection', function(reason, p){
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging here
});

// database 
//

console.log("connecting to mongodb")

mongoose.connect('mongodb://localhost/react-tutorial');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

// Local middleware
//
app.use(reactify(jsxRoutes));

// Set up routes
//
routes(app);
   
// handle errors
app.use((err, req, res, next) => {
    if (err.errors) {
        const errors = _.mapValues(err.errors, (err) => err.message);
        return res.status(400).json(errors);
    };
    next(err);
})

// run server

console.log("Running on port", port);
app.server = http.createServer(app);
app.server.listen(port);
