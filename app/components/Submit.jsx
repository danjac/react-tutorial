import React from 'react';
import Reflux from 'reflux';
import Router from 'react-router';
import _ from 'lodash';
import {Input, ProgressBar} from 'react-bootstrap';
import {Authenticate} from './Mixins';
import actions from '../actions';

export default React.createClass({

    mixins: [
        Authenticate,
        Reflux.listenTo(actions.submitPost, "onSubmitPost"),
        Reflux.listenTo(actions.submitPost.completed, "onSubmitPostCompleted"),
        Reflux.listenTo(actions.submitPost.failed, "onSubmitPostFailure")
    ],

    contextTypes: {
        router: React.PropTypes.func
    },

    getInitialState() {
        return {
            errors: {},
            progress: 0,
            enabled: true
        };
    },

    enableForm() {
        this.setState({
            progress: 0,
            enabled: true
        });
    },

    onSubmitPostCompleted() {
        this.enableForm();
        this.context.router.transitionTo(this.context.router.makeHref("latest"));
    },

    onSubmitPostFailure(errors) {
        if (errors) {
            this.setState({ errors: errors });
        }
        this.enableForm();
    },

    onSubmitPost() {

        this.setState({
            enabled: false,
            progress: 0
        });

        const update = (progress) => {
            return () => {
                this.setState({ progress: progress });
            };
        };

        for (var i = 0; i < 100; i++) {
            window.setTimeout(update(i), 100);
        }
    },

    handleSubmit(event) {
        event.preventDefault();
        const data = _.mapValues(this.refs, (ref) => ref.getValue());
        actions.submitPost(data);
    },

    progressBar() {
        if (this.state.enabled) {
            return '';
        }
        return <ProgressBar now={this.state.progress} />;
    },

    form() {

        const style = this.state.enabled ? {} : {display: "none"};

        return (
            <form style={style} onSubmit={this.handleSubmit}>
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
    },
    render() {

        return (
            <div>
            {this.progressBar()}
            {this.form()}
            </div>
        );
    }
});
