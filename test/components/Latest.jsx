var React = require('react/addons'),
    Router = require('react-router'),
    assert = require('assert'),
    Latest = require('../../client/components/Latest'),
    StubRouterContext = require('../StubRouterContext'),
    TestUtils = React.addons.TestUtils;

describe('Login component', function() {
    it('should show delete button if user', function() {

        var posts = [
            {
                id: 1,
                title: 'test',
                url: 'test',
                author_id: 1,
                author: 'test'
            },
            {
                id: 2,
                title: 'test',
                url: 'test',
                author_id: 2,
                author: 'test'
            }

        ];

        var user = {
            id: 1,
            name: 'tester'
        };
        var component = StubRouterContext(Latest, {
            posts: posts,
            user: user
        });
    });

});
