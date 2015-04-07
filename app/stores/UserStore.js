import Reflux from 'reflux'
import actions from '../actions'

export default Reflux.createStore({

    listenables: actions,

    init() {
        this.user = null;
    },

    getDefaultData() {
        return this.user;
    },

    isLoggedIn() {
        return this.user != null;
    },

    addUser(user) {
        this.user = user;
        this.trigger();
    },

    removeUser() {
        this.user = null;
        this.trigger();
    },

    getUserCompleted(user){
        this.addUser(user);
    },

    getUserFailed(){
        this.removeUser();
    },


    loginCompleted(user) {
        this.addUser(user);
    },

    signupCompleted(user) {
        this.addUser(user);
    },

    deletePost(post) {
        if (this.user) {
            this.user.totalScore -= post.score;
            this.trigger();
        }
    },

    submitPost(post) {
        if (this.user) {
            this.user.totalScore += 1;
            this.trigger();
        }
    },

    logout() {
        this.removeUser();
    },

    tallyVote(post) {
        this.user.votes.push(post._id);
        this.trigger();
    },

    voteUp(post) {
        this.tallyVote(post);
    },

    voteDown(post) {
        this.tallyVote(post);
    }

});

