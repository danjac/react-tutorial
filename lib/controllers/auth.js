import _ from 'lodash';
import Post from '../models/Post';

const vote = function*(amount) {

    const user = this.state.user;

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

export function* submit() {

    const user = this.state.user;

    yield new Post(
        _.assign(
            this.request.body, {
            author: user
        }))
        .save();

    yield user
        .update({ 
            totalScore: user.totalScore + 1 
        });

}

export function* upvote() {
    yield vote.call(this, 1);
}

export function* downvote() {
    yield vote.call(this, -1);
}


export function* deletePost() {

    const user = this.state.user;

    const post = yield Post
        .findOneAndRemove({
            _id: this.params.id,
            author: user._id
        })
        .exec();

    if (!post) {
        this.throw(404, "Post not found");
    }

    yield user.update({
        totalScore: user.totalScore - post.score
    });

    this.status = 204;

}

export function* getUser() {
    this.body = this.state.user;
}

