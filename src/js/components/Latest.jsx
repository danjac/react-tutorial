var React = require('react');

module.exports = React.createClass({

    render: function() {
        console.log("latest props", this.props);
        return (
            <div>Latest posts go here...</div>
        );
    }
});
