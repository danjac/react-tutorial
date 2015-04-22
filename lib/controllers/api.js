import passport from 'koa-passport';
import models from '../models';

const pageSize = 12;

const getPosts = function*(page, orderBy, where) {

    const offset = (page * pageSize) - pageSize;

    page = parseInt(page, 10) || 1;
    orderBy = ["score", "created"].includes(orderBy) ? orderBy : "created";

    const query = {
        include: [{
            model: models.User,
            as: 'author',
            attributes: ['id', 'name']
        }]
    };
    if (where) {
        query.where = where;
    }

    const total = yield models.Post.count(query);

    let posts = [];
    if (total) {

        query.offset = offset;
        query.limit = pageSize;
        query.order = orderBy;

        posts = yield models.Post.findAll(query);
    }

    const result = {
        total: total,
        posts: posts
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
        const doesExist = yield models.User
        .count({
            where: {
                [field]: this.request.query[field]
            }
        });

        this.body = {exists: Boolean(doesExist)};
    };

};

export const nameExists = exists("name");
export const emailExists = exists("email");

export function* signup() {

    const user = yield models.User.create(this.request.body);

    yield this.login(user);
    this.status = 200;
    this.body = user;

}


export function* search() {

    const q = "%" + this.query.q + "%";

    const where = ["title", "url", "author.name"].map((col) => {
        return [col + " LIKE ?", q];
    });

    this.body = yield getPosts(this.request.query.page,
                               this.request.query.orderBy,
                               {
                                   $or: where
                               });
}

export function* getUser() {

    this.body = yield getPosts(this.request.query.page,
                               this.request.query.orderBy,
                               ["author.name = ?", this.params.name]);

}
