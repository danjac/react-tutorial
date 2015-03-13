import React from 'react';
import Reflux from 'reflux';
import Router from 'react-router';
import {Input} from 'react-bootstrap';
import Immutable from 'immutable';
import {Authenticate} from './Mixins';
import validators from '../validators';
import actions from '../actions';

export default React.createClass({

    mixins: [
        Router.Navigation,
        Authenticate,
        Reflux.listenTo(actions.submitPostSuccess, "onSubmitPostSuccess"),
        Reflux.listenTo(actions.submitPostFailure, "onSubmitPostFailure")
    ],

    getInitialState() {
        return {
            errors: Immutable.Map()
        }
    },

    onSubmitPostFailure(errors) {
        if (!errors.isEmpty()) {
            this.setState({ errors: errors });
        }
    },

    onSubmitPostSuccess() {
        this.transitionTo(this.makeHref("latest"));
    },

    handleSubmit(event) {
        event.preventDefault();
        const title = this.refs.title.getValue(),
              url = this.refs.url.getValue(),
              errors = validators.newPost(title, url);

        if (errors.isEmpty()){
            actions.submitPost(title, url);
        }

        this.setState({ errors: errors });
    },

    render() {

        return (
            <form onSubmit={this.handleSubmit}>
                <Input ref="title" 
                       type="text" 
                       label="Title" 
                       required
                       bsStyle={this.state.errors.has("title")? 'error': null} 
                       help={this.state.errors.get("title", "")} />
                <Input ref="url" 
                       type="text" 
                       label="Link" 
                       placeholder="Enter a valid URL starting with http:// or https://"
                       required
                       bsStyle={this.state.errors.has("url")? 'error': null} 
                       help={this.state.errors.get("url", "")} />
                <Input type="submit" value="Submit post" />
            </form>
        );
    }
});
