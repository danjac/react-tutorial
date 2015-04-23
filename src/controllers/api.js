import passport from 'passport';
import models from '../models';

const pageSize = 12;

export function getPosts(page, orderBy, where) {

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
        query.order = orderBy + ' DESC';

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

export function index (req, res) {
    getPosts(req.query.page, "score")
    .then((result) => {
        res.reactify({ result: result });
    });
}

export function latest (req, res) {
    getPosts(req.query.page, "created")
    .then((result) => {
        res.reactify({ result: result });
    });
}


export function getAll(req, res) {
    getPosts(req.query.page, req.query.orderBy)
    .then((result) => {
        res.reactify({ result: result });
    });
}

export function loginPage(req, res) {
    res.reactify();
}

export function login(req, res, next) {

    passport.authenticate("local", (err, user, info) => {

        if(err) {
            next(err);
        }
        if (!user) {
            res.sendStatus(400);
        } else {
            req.logIn(user, (err) => {
                if (err) {
                    next(err);
                } else {
                    res.json(user);
                }
            });
        }

    })(req, res, next);

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
    .then((result) => {
        res.reactify({ result: result });
    });

}

export function getUser(req, res) {

    getPosts(req.query.page, req.query.orderBy,  ["author.name = ?", req.params.name])
    .then((result) => {
        res.reactify({ result: result });
    });

}
