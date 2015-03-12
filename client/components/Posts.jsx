var React = require('react'),
    {PropTypes} = React,
    Router = require('react-router'),
    _ = require('lodash'),
    moment = require('moment'),
    {Button, Modal, ModalTrigger, Pager, PageItem} = require('react-bootstrap'),
    actions = require('../actions');


var DeletePostModal = React.createClass({

    handleDelete: function(event) {
        event.preventDefault();
        actions.deletePost(this.props.post);
    },

    render: function() {

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

module.exports = React.createClass({

    propTypes: {
        posts: PropTypes.object,
        total: PropTypes.number,
        isFirst: PropTypes.bool,
        isLast: PropTypes.bool,
        user: PropTypes.object
    },
    mixins: [
        Router.Navigation
    ],


    handlePageClick: function(page) {
        this.props.fetchPosts(page);
    },
     
    handleLastPageClick: function(event) {
        event.preventDefault();
        if (this.props.isFirst) {
            return;
        }
        this.handlePageClick(this.props.page - 1);
    },

    handleNextPageClick: function(event) {
        event.preventDefault();
        if (this.props.isLast) {
            return;
        }
        this.handlePageClick(this.props.page + 1);
    },

    renderPager: function () {
        return (
            <Pager>
                <PageItem previous onClick={this.handleLastPageClick} disabled={this.props.isFirst}>&larr; Previous</PageItem>
                <PageItem next onClick={this.handleNextPageClick} disabled={this.props.isLast}>&rarr; Next</PageItem>
            </Pager>
        );

    },

    render: function() {

        var {Link} = Router;
        var user = this.props.user;

        var deleteLink = function(post) {
            if (user && post.author_id === user.id) {

                var modal = <DeletePostModal post={post} />;

                return (
                    <ModalTrigger modal={modal}>
                        <a href="#">delete</a>
                    </ModalTrigger>
                );
            }
            return '';
        }

        var votingLinks = function(post) {

            if (!user || user.id === post.author_id || _.includes(user.votes, post.id)){
                return '';
            }

            var handleVoteUp = function(event) { 
                event.preventDefault();
                actions.voteUp(post);
            };

            var handleVoteDown = function(event) { 
                event.preventDefault();
                actions.voteDown(post); 
            };

            return (
                <span>
                    <a href="#" onClick={handleVoteUp}><i className="glyphicon glyphicon-arrow-up"></i></a>
                    <a href="#" onClick={handleVoteDown}><i className="glyphicon glyphicon-arrow-down"></i></a>
                </span>
            );
        };

        var links = function(post) {
            return (
                <span>
                    {deleteLink(post)}
                    {votingLinks(post)}
                </span>
            );
        };

        return (
            <div>
                <ul className="list-unstyled">
                    {this.props.posts.map(function(post) {
                        return (
                            <li key={post.id}>
                                <b><a href={post.url} target="_blank">{post.title}</a></b>
                                <div>
                                    <small>
                                        <mark>
                                            <Link to={this.makeHref("user", {name: post.author})}>{post.author}</Link>
                                            &nbsp; Score: <b>{post.score}</b>
                                            &nbsp; Posted: <b>{moment(post.created_at).fromNow()}</b>
                                            &nbsp; {links(post)} 
                                        </mark>
                                    </small>
                                </div>
                            </li> 
                        );
                    }.bind(this)).toJS()}
                </ul>
                {this.renderPager()}
            </div>
        );
    }
});
