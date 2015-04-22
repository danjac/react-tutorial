import passport from 'koa-passport';
import User from '../models/User';
import Post from '../models/Post';

const pageSize = 12;

const getPosts = function*(page, orderBy, where) {

    const offset = (page * pageSize) - pageSize;

    page = parseInt(page, 10) || 1;
    orderBy = ["score", "created"].includes(orderBy) ? orderBy : "created";

    const query = {
        offset: offset,
        limit: pageSize,
        order: orderBy,
        include: [{
            model: User,
            attributes: ['id', 'name']
        }]
    };
    if (where) {
        query.where = where;
    }

    const queryResult = yield Post.findAndCountAll(query);

    const result = {
        total: queryResult.count,
        posts: queryResult.rows
    }

    const numPages = Math.ceil(result.total / pageSize);

    result.isFirst = (page === 1);
    result.isLast = (page === numPages);

    return result;
};


export function* getAll() {
    this.body = yield getPosts(this.request.query.page,
                               this.request.query.orderBy);
}

export function* login() {

    const ctx = this;

    yield passport.authenticate("local", function*(err, user, info){

        if(err) {
            throw err;
        }
        if (user === false) {
            ctx.status = 400;
            ctx.body = "Invalid credentials";
        } else {
            yield ctx.login(user);
            ctx.body = user;
        }

    });

}

const exists = (field) => {

    return function*() {

        const value = this.request.query[field].trim();
        if (!value) {
            this.throw(400, "No value provided");
        }
        const doesExist = yield User
        .findAll({
            where: {
                [field]: this.request.query[field]
            }
        })
        .count();

        this.body = {exists: Boolean(doesExist)};
    };

};

export const nameExists = exists("name");
export const emailExists = exists("email");

export function* signup() {

    const user = yield new User(this.request.body)
        .create();

    yield this.login(user);
    this.status = 200;
    this.body = user;

}


export function* search() {

    const q = {$like: "%" + this.query.q + "%"};

    this.body = yield getPosts(this.request.query.page,
                               this.request.query.orderBy,
                               {
                                   $or: [{title: q, url: q, "author.name": q}]
                               });
}

export function* getUser() {

    this.body = yield getPosts(this.request.query.page,
                               this.request.query.orderBy,
                               {
                                   "author.name": this.params.name
                               });

}
