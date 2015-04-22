import passport from 'passport';
import models from '../models';

const pageSize = 12;

const getPosts = (page, orderBy, where) => {

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

    const result = {};

    return models.Post

    .count(query)
    .then((count) => {

        result.total = count;

        query.offset = offset;
        query.limit = pageSize;
        query.order = orderBy;

        return models.Post.findAll(query);
    })
    .then((posts) => {
        result.posts = posts;

        const numPages = Math.ceil(result.total / pageSize);

        result.isFirst = (page === 1);
        result.isLast = (page === numPages);

        return result;
    });
};


export function getAll(req, res) {
    getPosts(req.query.page, req.query.orderBy)
    .then((result) => {
        res.json(result);
    });
}

export function login(req, res) {

    passport.authenticate("local", (err, user, info) => {

        if(err) {
            throw err;
        }
        if (user === false) {
            res.sendStatus(400);
        } else {
            req.login(user);
            res.json(user);
        }

    });

}

const exists = (field) => {

    return (req, res) => {
        const value = req.query[field].trim();
        if (!value) {
            return res.setStatus(400);
        }
        models.User
        .count({
            where: {
                [field]: req.query[field]
            }
        })
        .then((result) => {
            res.json({exists: result > 0});
        });
    }

};

export const nameExists = exists("name");
export const emailExists = exists("email");

export function signup(req, res) {

    models.User
    .create(req.body)
    .then((user) => {
        req.login(user);
        res.json(user);
    });

}


export function search(req, res) {

    const q = "%" + req.query.q + "%";

    const where = ["title", "url", "author.name"].map((col) => {
        return [col + " LIKE ?", q];
    });

    getPosts(req.query.page, req.query.orderBy, { $or: where })
    .then((result) => { res.json(result) });

}

export function getUser() {

    getPosts(req.query.page, req.query.orderBy,  ["author.name = ?", this.params.name])
    .then((result) => { res.json(result) });

}
