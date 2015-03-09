var React = require('react'),
    Reflux = require('reflux'),
    Router = require('react-router'),
    _ = require('lodash'),
    {Button, Modal, ModalTrigger, Pager, PageItem} = require('react-bootstrap'),
    PostStore = require('../stores/PostStore'),
    actions = require('../actions');


var DeletePostModal = React.createClass({

    handleDelete: function(event) {
        event.preventDefault();
        actions.deletePost(this.props.post);
    },

    render: function() {

        return (
            <Modal title="Delete post" closeButton={false}>
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

    mixins: [
        Router.Navigation,
        Reflux.listenTo(PostStore, 'onUpdate')
    ],

    getInitialState: function() {
        return PostStore.getDefaultData();
    },

    componentWillMount: function() {
        // by default use props
        var posts = this.props.posts;
        if (posts !== undefined) {
            this.setState({ posts: posts });
        }
    },


    componentDidMount: function() {
        this.hydrate();
    },

    componentWillReceiveProps: function() {
        this.hydrate();
    },

    hydrate: function() {
        this.props.fetchPosts(1);
    },

    handlePageClick: function(page) {
        this.props.fetchPosts(page);
    },
    
    handleLastPageClick: function(event) {
        event.preventDefault();
        if (this.state.isFirst) {
            return;
        }
        this.handlePageClick(this.state.page - 1);
    },

    handleNextPageClick: function(event) {
        event.preventDefault();
        if (this.state.isLast) {
            return;
        }
        this.handlePageClick(this.state.page + 1);
    },

    onUpdate: function(data) {
        this.setState(data);
    },

    renderPager: function () {
        return (
            <Pager>
                <PageItem previous onClick={this.handleLastPageClick} disabled={this.state.isFirst}>&larr; Previous</PageItem>
                <PageItem next onClick={this.handleNextPageClick} disabled={this.state.isLast}>&rarr; Next</PageItem>
            </Pager>
        );

    },

    render: function() {

        var posts = this.state.posts || [];
        var user = this.props.user;
        var {Link} = Router;

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
            // tbd: check if you've voted

            if (!user || user.id === post.author_id || _.contains(user.votes, post.id)){
                return '';
            }

            var handleVoteUp = function(event) { 
                event.preventDefault();
                actions.voteUp(post.id) 
            };

            var handleVoteDown = function(event) { 
                event.preventDefault();
                actions.voteDown(post.id) 
            };

            return (
                <span>
                    <a href="#" onClick={handleVoteUp}><i className="glyphicon glyphicon-arrow-up"></i></a>
                    <a href="#" onClick={handleVoteDown}><i className="glyphicon glyphicon-arrow-down"></i></a>
                </span>
            );
        };

        return (
            <div>
                <ul className="list-unstyled">
                    {posts.map(function(post) {
                        return (
                            <li key={post.id}>
                                <div className="row">
                                    <div className="col-xs-1">
                                        {votingLinks(post)}
                                    </div>
                                    <div className="col-xs-11">
                                        <a href={post.url} target="_blank">{post.title}</a><br />
                                        <small>
                                        <mark><Link to={this.makeHref("user", {name: post.author})}>{post.author}</Link></mark>
                                        <mark>Score: <b>{post.score}</b></mark>
                                        {deleteLink(post)} 
                                        </small>
                                    </div>
                                </div>
                            </li> 
                        );
                    }.bind(this))}
                </ul>
                {this.renderPager()}
            </div>
        );
    }
});
