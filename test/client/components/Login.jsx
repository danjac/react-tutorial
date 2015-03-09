var React = require('react/addons'),
    assert = require('assert'),
    Login = require('../../client/components/Login'),
    TestUtils = React.addons.TestUtils;


describe('Login component', function() {

    before('render and locate element', function() {
        this.renderedComponent = TestUtils.renderIntoDocument(<Login />);
    });
    
    it('<form> should exist', function() {
        assert(this.formComponent !== undefined);
    });


});
