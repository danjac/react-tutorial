import Reflux from 'reflux';
import _ from 'lodash';
import actions from '../actions';

export default Reflux.createStore({

    listenables: actions,

    init() {
        this.user = null;
    },

    getDefaultData() {
        return this.user;
    },

    isLoggedIn() {
        return !_.isEmpty(this.user);
    },

    getUserComplete(user){
        this.user = user;
        this.trigger();
    },

    loginSuccess(user) {
        this.user = user;
        this.trigger();
    },

    signupSuccess(user) {
        this.user = user;
        this.trigger();
    },

    logout() {
        this.user = null;
        this.trigger();
    },

    tallyVote(post) {
        this.user.votes.push(post.id);
        this.trigger();
    },

    voteUp(post) {
        this.tallyVote(post);
    },

    voteDown(post) {
        this.tallyVote(post);
    }

});
 
