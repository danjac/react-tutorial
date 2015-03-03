var React = require('react'),
    Reflux = require('reflux'),
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
        // only fetch if we need to 
        if (this.props.posts === undefined) {
            this.props.fetchPosts(1);
        }
    },

    handlePageClick: function(page) {
        this.props.fetchPosts(page);
    },

    onUpdate: function(data) {
        this.setState(data);
    },

    render: function() {
        var posts = this.state.posts || [];

        return (
            <ul className="list-unstyled">
                {posts.map(function(post) {
                    return (
                        <li key={post.id}>
                            <a href={post.url} target="_blank">{post.title}</a><br />
                            <small><mark><a href="#">{post.author}</a></mark></small>
                        </li> 
                    );
                })}
            </ul>
        );
    }
});
