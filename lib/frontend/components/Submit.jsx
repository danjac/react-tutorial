import React from 'react';
import Reflux from 'reflux';
import Router from 'react-router';
import _ from 'lodash';
import {Input} from 'react-bootstrap';
import {Authenticate} from './Mixins';
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
            errors: {}
        }
    },

    onSubmitPostFailure(errors) {
        this.setState({ errors: errors });
    },

    onSubmitPostSuccess() {
        this.transitionTo(this.makeHref("latest"));
    },

    handleSubmit(event) {
        event.preventDefault();

        const data = _.mapValues(this.refs, (ref) => ref.getValue());
        actions.submitPost(data);

    },

    render() {

        return (
            <form onSubmit={this.handleSubmit}>
                <Input ref="title" 
                       type="text" 
                       label="Title" 
                       required
                       bsStyle={this.state.errors.title? 'error': null} 
                       help={this.state.errors.title} />
                <Input ref="url" 
                       type="text" 
                       label="Link" 
                       placeholder="Enter a valid URL starting with http:// or https://"
                       required
                       bsStyle={this.state.errors.url? 'error': null} 
                       help={this.state.errors.url} />
                <Input type="submit" value="Submit post" />
            </form>
        );
    }
});
