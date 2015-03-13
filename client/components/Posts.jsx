import React, {PropTypes} from 'react';
import Router, {Link} from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import {Button, Modal, ModalTrigger, Pager, PageItem} from 'react-bootstrap';
import actions from '../actions';


const DeletePostModal = React.createClass({

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
                    <Button bsStyle="primary" onClick={this.handleDelete}>Delete</Button>
                </div>
            </Modal>

        );
    }
});


const PostListItem = React.createClass({

    propTypes: {
        post: PropTypes.object,
        user: PropTypes.object
    },

    mixins: [
        Router.Navigation
    ],

    handleVoteUp(event) {
        event.preventDefault();
        actions.voteUp(this.props.post); 
    },

    handleVoteDown(event) { 
        event.preventDefault();
        actions.voteDown(this.props.post); 
    },

    deleteLink() {
        const user = this.props.user,
              post = this.props.post;
        if (user && post.author_id === user.id) {
            let modal = <DeletePostModal post={post} />;
            return (
                <ModalTrigger modal={modal}>
                    <a href="#">delete</a>
                </ModalTrigger>
            );
        }
        return '';
    },

    votingLinks() {
        const user = this.props.user,
              post = this.props.post;

        if (!user || user.id === post.author_id || _.includes(user.votes, post.id)){
            return '';
        }

        return (
            <span>
                <a href="#" onClick={this.handleVoteUp}><i className="glyphicon glyphicon-arrow-up"></i></a>
                <a href="#" onClick={this.handleVoteDown}><i className="glyphicon glyphicon-arrow-down"></i></a>
            </span>
        );

    },

    render() {

        const post = this.props.post;

        return (
            <li>
                <b><a href={post.url} target="_blank">{post.title}</a></b>
                <div>
                    <small>
                        <mark>
                            <Link to={this.makeHref("user", {name: post.author})}>{post.author}</Link>
                            &nbsp; Score: <b>{post.score}</b>
                            &nbsp; Posted: <b>{moment(post.created_at).fromNow()}</b>
                            &nbsp; {this.deleteLink()} {this.votingLinks()}
                        </mark>
                    </small>
                </div>
            </li> 
        );
    }

});

export default React.createClass({

    propTypes: {
        posts: PropTypes.object,
        total: PropTypes.number,
        isFirst: PropTypes.bool,
        isLast: PropTypes.bool,
        user: PropTypes.object
    },

    handlePageClick(page) {
        this.props.fetchPosts(page);
    },
     
    handleLastPageClick(event) {
        event.preventDefault();
        if (this.props.isFirst) {
            return;
        }
        this.handlePageClick(this.props.page - 1);
    },

    handleNextPageClick(event) {
        event.preventDefault();
        if (this.props.isLast) {
            return;
        }
        this.handlePageClick(this.props.page + 1);
    },

    renderPager() {
        return (
            <Pager>
                <PageItem previous onClick={this.handleLastPageClick} disabled={this.props.isFirst}>&larr; Previous</PageItem>
                <PageItem next onClick={this.handleNextPageClick} disabled={this.props.isLast}>&rarr; Next</PageItem>
            </Pager>
        );
    },


    render() {
        return (
            <div>
                <ul className="list-unstyled">
                    {this.props.posts.map((post) => {
                        return <PostListItem key={post.id} post={post} user={this.props.user} />;
                    }).toJS()}
                </ul>
                {this.renderPager()}
            </div>
        );
    }
});
