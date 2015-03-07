var React = require('react'),
    {PureRenderMixin} = require('react/addons'),
    {Well} = require('react-bootstrap');

// "blank" page for handling e.g. server side pre-rendering
// where we can't render directly because of transition issues etc
//
module.exports = React.createClass({

    mixins: [PureRenderMixin],

    render: function() {
        return (
            <Well><h1>Please wait.....</h1></Well>
        );
    }
});