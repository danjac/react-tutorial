import jwt from 'jsonwebtoken';
import User from '../models/User';
import Post from '../models/Post';


const pageSize = 20;

const jwtToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
        expiresInMinutes: 60 * 24
    });
};


const getPosts = function*(page, orderBy, where) {

    const result = {},
          offset = (page * pageSize) - pageSize;

    page = parseInt(page, 10) || 1;
    orderBy = ["score", "created"].includes(orderBy) ? orderBy : "created";

    where = where || {}

    result.total = yield Post.find(where).count();

    const numPages = Math.ceil(result.total / pageSize);

    result.isFirst = (page === 1);
    result.isLast = (page === numPages);

    result.posts = yield Post
        .find(where)
        .populate('author', '_id name')
        .sort("-" + orderBy)
        .limit(pageSize)
        .skip(offset)
        .exec();

    return result;
};


export function* getAll() {
    this.body = yield getPosts(this.request.query.page,
                               this.request.query.orderBy);
}


export function* login() {

    const badResult = () => {
        this.throw(400, "Invalid login credentials");
    };

    const {identity, password} = this.request.body

    if (!identity || !password) {
        badResult();
    }

    const user = yield User.authenticate(identity, password);

    if (!user) {
        badResult();
    }

    this.body = {
        token: jwtToken(user._id),
        user: user
    };


}

export function* signup() {
    const user = yield User(this.request.body)
        .save();

    this.body = {
        token: jwtToken(user._id),
        user: user
    };

}


export function* search() {
    this.body = yield getPosts(this.request.query.page,
                               this.request.query.orderBy,
                               {
                                    title: new RegExp(this.request.query.q, "i")
                               });
}

export function* getUser() {
    const user = yield User
        .findOne()
        .where("name", this.params.name)
        .exec();

    if (!user) {
        this.throw(404, "No user found");
    }

    this.body = yield getPosts(this.request.query.page,
                               this.request.query.orderBy,
                               {
                                   author: user._id
                               });

}
