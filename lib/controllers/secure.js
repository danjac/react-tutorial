import _ from 'lodash';
import models from '../models';
import co from 'co';
import {createThumbnail, deleteThumbnail} from '../utils/image';

const vote = function*(amount) {

    const user = this.passport.user;

    const post = yield co(
        models.Post
        .findOne({
            where: {
                id: this.params.id,
                $not: {
                    author_id: user.id,
                    id: user.votes
                }
            },
            include: [{
                model: models.User,
                as: 'author',
            }]
        })
        .then((post) => {

            if (!post) {
                this.throw(404, "No post found");
            }

            return post;
        })
    );

    console.log(post);

    user.votes = user.votes || [];
    user.votes.push(post.id);

    Promise.all([

        post.update({
            score: post.score + amount
        }),

        post.author.update({
            totalScore: post.author.totalScore + amount
        }),

        user.update({
            votes: user.votes
        })

    ]);

    this.status = 200;
};


export function* submit() {

    // fetch and resize image
    //
    //

    const {title, url, comment, image} = this.request.body;

    let filename;

    try {
        filename = yield createThumbnail(image);
    } catch(e) {
        this.status = 400;
        this.body = { image: e.toString() };
        return;
    }

    const user = this.passport.user;

    yield models.Post.create({
            title: title,
            url: url,
            comment: comment,
            image: filename,
            author_id: user.id
        });

    yield user
        .update({
            totalScore: user.totalScore + 1
        });

    this.status = 204;

}

export function* upvote() {
    yield vote.call(this, 1);
}

export function* downvote() {
    yield vote.call(this, -1);
}


export function* deletePost() {

    const user = this.passport.user;

    const post = yield co(models.Post
    .findOne({
        where: {
            id: this.params.id,
            author_id: user.id
        }
    })
    .then((post) => {
        if (!post) {
            this.throw(404, "Post not found");
        }
        return post;
    }));

    Promise.all([
        post.destroy(),
        deleteThumbnail(post.image),
        user.update({
        totalScore: user.totalScore - post.score
        })
    ]);

    this.status = 204;

}

export function* getUser() {
    this.body = this.passport.user;
}


export function* isSecure(next) {
    if (!this.isAuthenticated()) {
        this.throw(401, "You must be signed in to do this!");
    }
    yield* next;
}
