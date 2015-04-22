import middleware from './middleware';
import passport from './passport';
import routes from './routes';

export default function(app) {

    middleware(app);
    passport(app);
    routes(app);

}
