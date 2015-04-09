import _ from 'lodash';
import Post from '../models/Post';
import {createThumbnail, deleteThumbnail} from '../utils/image';

const vote = function*(amount) {

    const user = this.passport.user;

    const post = yield Post
        .findById(this.params.id)
        .populate('author')
        .exec();

    if (!post) {
        this.throw(404, "No post found");
    }

    if (post.author._id === user._id ||
        user.votes.includes(post._id)) {
        this.throw(403, "You can't vote on this post");
    }

    user.votes.push(post._id)

    this.status = 200;

    return Promise.all([

        post.update({
            score: post.score + amount
        }).exec(),

        post.author.update({
            totalScore: post.author.totalScore + amount
        }).exec(),

        user.update({
            votes: user.votes
        }).exec()

    ]);
}

export function* logout() {
    this.logout();
    this.session = null;
    this.status = 204;
}


export function* submit() {

    // fetch and resize image
    //
    //

    if (!this.request.body.image) {
        this.status = 400;
        this.body = { image: "no image provided" };
        return;
    }

    const {title, url, comment, image} = this.request.body;

    const filename = yield createThumbnail(image);

    const user = this.passport.user;

    yield new Post({
            title: title,
            url: url, 
            comment: comment,
            author: user,
            image: filename
        })
        .save();

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

    const post = yield Post
        .findOneAndRemove({
            _id: this.params.id,
            author: user._id
        })
        .exec();

    if (!post) {
        this.throw(404, "Post not found");
    }

    yield deleteThumbnail(post.image);

    yield user.update({
        totalScore: user.totalScore - post.score
    });

    this.status = 204;

}

export function* getUser() {
    this.body = this.passport.user;
}


export function* isSecure(next) {
    if (!this.isAuthenticated()) {
        this.throw(401, "You must be signed in to do this!");
    }
    yield next;
}
