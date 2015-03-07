var React = require('react'),
    Reflux = require('reflux'),
    {Pager, PageItem} = require('react-bootstrap'),
    PostStore = require('../stores/PostStore'),
    actions = require('../actions');


module.exports = React.createClass({

    mixins: [
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
        this.props.fetchPosts(1);
    },

    handlePageClick: function(page) {
        this.props.fetchPosts(page);
    },

    onUpdate: function(data) {
        this.setState(data);
    },

    render: function() {

        var posts = this.state.posts || [];
        var user = this.props.user;

        var onLastPageClick = function(event) {
            event.preventDefault();
            if (this.state.isFirstPage) {
                return;
            }
            this.handlePageClick(this.state.page - 1);
        };

        var onNextPageClick = function(event) {
            event.preventDefault();
            if (this.state.isLastPage) {
                return;
            }
            this.handlePageClick(this.state.page + 1);
        };

       var pager = (
            <Pager>
                <PageItem previous disabled={this.state.isFirst}>&larr; Previous</PageItem>
                <PageItem next disabled={this.state.isLast}>&rarr; Next</PageItem>
            </Pager>
        );
        var deleteLink = function(post) {
            var handleDelete = function(event) {
                console.log("deleting...");
                event.preventDefault();
                actions.deletePost(post);
            };
            if (user && post.author_id === user.id) {
                return <a onClick={handleDelete}>delete</a>;
            }
            return '';
        }

        return (
            <div>
                <ul className="list-unstyled">
                    {posts.map(function(post) {
                        return (
                            <li key={post.id}>
                                <a href={post.url} target="_blank">{post.title}</a><br />
                                <small><mark><a href="#">{post.author}</a></mark>
                                {deleteLink(post)} 
                                </small>
                            </li> 
                        );
                    })}
                </ul>
                {pager}
            </div>
        );
    }
});
