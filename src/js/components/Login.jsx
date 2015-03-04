var React = require('react'),
    actions = require('../actions');

module.exports = React.createClass({

    handleSubmit: function(event) {
        event.preventDefault();
        var identity = this.refs.identity.getDOMNode().value,
            password = this.refs.password.getDOMNode().value;

        actions.login(identity, password);

    },
    
    render: function() {

        return (

        <form onSubmit={this.handleSubmit}>
            <div className="form-group">
                <label htmlFor="identity">Email or username</label>
                <input className="form-control" type="text" id="identity" ref="identity" />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input className="form-control" type="password" id="password" ref="password" />
            </div>
            <button type="submit" className="btn btn-default">Login</button>
        </form>
        );
    }
});
