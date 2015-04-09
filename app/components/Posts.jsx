import React, {PropTypes} from 'react';
import {PureRenderMixin} from 'react/addons';
import Router, {Link} from 'react-router';
import Immutable from 'immutable';
import _ from 'lodash';
import moment from 'moment';
import {Button, Modal, ModalTrigger, Pager, PageItem} from 'react-bootstrap';
import actions from '../actions';


const DeletePostModal = React.createClass({

    mixins: [PureRenderMixin],

    handleDelete (event) {
        event.preventDefault();
        actions.deletePost(this.props.post);
    },

    render() {

        return (
            <Modal title="Delete post" closeButton={false} onRequestHide={null}>
                <div className="modal-body">
                    Are you sure you want to delete your post?
                </div>
                <div className="modal-footer">
                    <Button onClick={this.props.onRequestHide}>Cancel</Button>
                    <Button bsStyle="primary" onClick={this.handleDelete}>Yes, I'm sure</Button>
                </div>
            </Modal>

        )
    }
})


const PostListItem = React.createClass({

    propTypes: {
        post: PropTypes.object,
        user: PropTypes.object
    },

    mixins: [
        PureRenderMixin
    ],

    contextTypes: {
        router: PropTypes.func
    },

    handleVoteUp(event) {
        event.preventDefault()
        actions.voteUp(this.props.post) 
    },

    handleVoteDown(event) { 
        event.preventDefault()
        actions.voteDown(this.props.post) 
    },

    deleteLink() {
        const user = this.props.user,
              post = this.props.post
        if (user && post.author._id === user._id) {
            const modal = <DeletePostModal post={post} />
            return (
                <ModalTrigger modal={modal}>
                    <a href="#">delete</a>
                </ModalTrigger>
            )
        }
        return ''
    },

    votingLinks() {
        const user = this.props.user,
              post = this.props.post

        if (!user || user._id === post.author._id || _.includes(user.votes, post._id)){
            return ''
        }

        return (
            <span>
                <a href="#" onClick={this.handleVoteUp}><i className="glyphicon glyphicon-arrow-up"></i></a>
                <a href="#" onClick={this.handleVoteDown}><i className="glyphicon glyphicon-arrow-down"></i></a>
            </span>
        )

    },

    render() {

        const post = this.props.post

        return (
            <li>
                <b><a href={post.url} target="_blank">{post.title}</a>
                &nbsp;<small>{new URL(post.url).hostname}</small></b>
                <div>
                    <small>
                        <mark>
                            Score: <b>{post.score}</b>
                            &nbsp; Posted by: <Link to={this.context.router.makeHref("user", {name: post.author.name})}>{post.author.name}</Link>
                            &nbsp; <b>{moment(post.created).fromNow()}</b>
                            &nbsp; {this.deleteLink()} {this.votingLinks()}
                        </mark>
                    </small>
                </div>
            </li> 
        )
    }

})

export default React.createClass({

    mixins: [PureRenderMixin],

    propTypes: {
        result: PropTypes.object,
        user: PropTypes.object,
        fetchPosts: PropTypes.func
    },

    getDefaultProps() {
        return {
            result: {
                total: 0,
                isFirst: true,
                isLast: true,
                posts: Immutable.List(),
                page: 1
            }
        };
    },


    handlePageClick(page) {
        this.props.fetchPosts(page);
    },
     
    handleLastPageClick(event) {
        event.preventDefault()
        if (this.props.result.isFirst) {
            return;
        }
        this.handlePageClick(this.props.result.page - 1);
    },

    handleNextPageClick(event) {
        event.preventDefault()
        if (this.props.result.isLast) {
            return;
        }
        this.handlePageClick(this.props.result.page + 1);
    },

    renderPager() {
        return (
            <Pager>
                <PageItem previous onClick={this.handleLastPageClick} disabled={this.props.result.isFirst}>&larr; Previous</PageItem>
                <PageItem next onClick={this.handleNextPageClick} disabled={this.props.result.isLast}>&rarr; Next</PageItem>
            </Pager>
        );
    },


    render() {

        return (
            <div>
                <div className="container">
                    <div className="col-md-2 col-md-offset-10 text-right">
                        <b>Total: {this.props.result.total}</b>
                    </div>
                </div>
                <ul className="list-unstyled">
                    {this.props.result.posts.map((post) => {
                        return <PostListItem key={post._id} post={post} user={this.props.user} />
                    }).toJS()}
                </ul>
                {this.renderPager()}
            </div>
        );
    }
})
