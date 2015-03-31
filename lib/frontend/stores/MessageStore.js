import Reflux from 'reflux'
import Immutable from 'immutable'
import actions from '../actions'


export default Reflux.createStore({

    listenables: actions,
    
    init() {
        this.messages = Immutable.List()
    },

    getDefaultData() {
        return this.messages
    },

    addMessage(level, msg) {
        this.messages = this.messages.push({ level: level, text: msg })
        this.trigger()
    },

    dismissAlert(index) {
        this.messages = this.messages.delete(index)
        this.trigger()
    },

    success(msg){
        this.addMessage("success", msg)
    },

    warning(msg){
        this.addMessage("warning", msg)
    },

    loginSuccess(user) {
        this.success("Welcome back, " + user.name)
    },

    loginFailure() {
        console.log("LOGINFAILUREMSG")
        this.warning("Sorry, you have entered incorrect login info")
    },

    logout() {
        this.success("Bye for now")
    },

    deletePostComplete(post) {
        this.success(`Your post "${post.title}" has been deleted!`)            
    },

    submitPostSuccess() {
        this.success("Thank you for your post!")
    },

    loginRequired() {
        this.warning("Please login to continue")
    },

    signupSuccess(user) {
        this.success(`Hi ${user.name}! Welcome to the site!`)
    }

})


