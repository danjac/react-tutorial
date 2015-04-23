import _ from 'lodash';
import models from '../models';
import {createThumbnail, deleteThumbnail} from '../utils/image';

const vote = (amount) => {

    return (req, res, next) => {

        models.Post
        .findOne({
            where: [
                { id: req.params.id },
                { $not: { author_id: req.user.id } },
                { $not: { id: req.user.votes } }
            ],
            include: [{
                model: models.User,
                as: 'author',
            }]
        })
        .then((post) => {

            if (!post) {
                return  null;
            }

            const votes = req.user.votes ? req.user.votes.slice(0) : [];
            votes.push(post.id);

            return Promise.all([

                post.update({
                    score: post.score + amount
                }),

                req.user.update({
                    votes: votes
                }),

                post.author.update({
                    totalScore: post.author.totalScore + amount
                })

            ]);
        })
        .then((result) => {
            const status = result ? 204 : 404;
            res.sendStatus(status);
        })
        .catch((err) => next(err));
    };

};

export function submitPage(req, res) {
    res.reactify();
}

export function submit(req, res, next) {

    // fetch and resize image
    //
    //

    const {title, url, comment, image} = req.body;

    createThumbnail(image)
    .then((filename) => {
        return models.Post
        .create({
            title: title,
            url: url,
            comment: comment,
            image: filename,
            author_id: req.user.id
        });

    })
    .then((post) => {
        req.user.update({
            totalScore: req.user.totalScore + 1
        });
    })
    .then(() => res.sendStatus(204))
    .catch((err) => next(err));
}

export const upvote = vote(1);
export const downvote = vote(-1);

export function deletePost(req, res, next) {

    models.Post
    .findOne({
        where: {
            id: req.params.id,
            author_id: req.user.id
        }
    })
    .then((post) => {
        if (!post) {
            return res.sendStatus(404);
        }
        return Promise.all([
            post.destroy(),
            deleteThumbnail(post.image),
            req.user.update({
                totalScore: req.user.totalScore - post.score
            })
        ])
    })
    .then(() => {
        res.sendStatus(204);
    })
    .catch((err) => next(err) );

}

export function isSecure(req, res, next) {
    if (!req.isAuthenticated()) {
        res.sendStatus(401)
    } else {
        next();
    }
}
