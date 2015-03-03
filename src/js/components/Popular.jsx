var React = require('react'),
    Reflux = require('reflux'),
    PostStore = require('../stores/PostStore'),
    actions = require('../actions');


module.exports = React.createClass({

    propTypes: {
        posts: React.PropTypes.array,
        page: React.PropTypes.number
    },

    mixins: [
        Reflux.listenTo(PostStore, 'onUpdate')
    ],

    getInitialState: function() {
        if (this.props.preloaded === 'popular') {
            return this.props;
        }
        return PostStore.getDefaultData();
    },

    componentDidMount: function() {
        if (this.props.preloaded !== 'popular') {
            actions.fetchPosts(1);
        }
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
                            <a href={post.url} target="_blank">{post.title}</a>
                        </li> 
                    );
                })}
            </ul>
        );
    }
});
