import React from 'react';
import Reflux from 'reflux';
import Router from 'react-router';
import _ from 'lodash';
import {Input} from 'react-bootstrap';
import {Authenticate} from './Mixins';
import actions from '../actions';

export default React.createClass({

    mixins: [
        Authenticate,
        Reflux.listenTo(actions.submitPost, "onSubmitPost"),
        Reflux.listenTo(actions.submitPost.failed, "onSubmitPostFailure")
    ],

    contextTypes: {
        router: React.PropTypes.func
    },

    getInitialState() {
        return {
            errors: {}
        };
    },

    onSubmitPostFailure(errors) {
        this.setState({ errors: errors });
    },

    onSubmitPost() {
        this.context.router.transitionTo(this.context.router.makeHref("latest"));
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
                <Input ref="image" 
                       type="text" 
                       label="Image" 
                       placeholder="Enter link to the image you want to pin"
                       required
                       bsStyle={this.state.errors.image? 'error': null} 
                       help={this.state.errors.image} />
                <Input ref="comment" 
                       type="textarea" 
                       label="Comment" 
                       placeholder="Any stories to tell?"
                       bsStyle={this.state.errors.comment? 'error': null} 
                       help={this.state.errors.comment} />
                  <Input type="submit" value="Submit post" />
            </form>
        );
    }
});
