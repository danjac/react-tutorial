import _ from 'lodash';
import models from '../models';
import {createThumbnail, deleteThumbnail} from '../utils/image';

const vote = (amount) => {

    return (req, res) => {

        models.Post
        .findOne({
            where: {
                id: req.params.id,
                $not: {
                    author_id: req.user.id,
                    id: req.user.votes
                }
            },
            include: [{
                model: models.User,
                as: 'author',
            }]
        })
        .then((post) => {

            if (!post) {
                return res.sendStatus(404);
            }

            req.user.votes = req.user.votes || [];
            req.user.votes.push(post.id);

            Promise.all([

                post.update({
                    score: post.score + amount
                }),

                post.author.update({
                    totalScore: post.author.totalScore + amount
                }),

                req.user.update({
                    votes: req.user.votes
                })

            ]);
            res.sendStatus(204);
        });
    };

};


export function submit(req, res) {

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
            totalScore: user.totalScore + 1
        });
    })
    .then(() => res.sendStatus(204));
}

export const upvote = vote(1);
export const downvote = vote(-1);

export function deletePost(req, res) {

    models.Post
    .findOne({
        where: {
            id: this.params.id,
            author_id: user.id
        }
    })
    .then((post) => {
        if (!post) {
            return res.sendStatus(404);
        }
        return Promise.all([
            post.destroy(),
            deleteThumbnail(post.image),
            user.update({
            totalScore: user.totalScore - post.score
            })
        ])
    })
    .then(() => {
        res.sendStatus(204);
    });

}

export function isSecure(req, res, next) {
    if (!req.isAuthenticated()) {
        res.sendStatus(401)
    }
    next(req, res);
}
