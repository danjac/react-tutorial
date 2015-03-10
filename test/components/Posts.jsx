var React = require('react/addons'),
    Router = require('react-router'),
    sinon = require('sinon'),
    {expect} = require('chai'),
    _ = require('lodash'),
    TestUtils = React.addons.TestUtils,
    Posts = require('../../client/components/Posts'),
    StubRouterContext = require('../StubRouterContext');

describe('Login component', function() {

    it('should show correct buttons for a user', function() {
        var actions = require('../../client/actions');
        var posts = [
            {
                id: 1,
                title: 'test',
                url: 'http://test',
                author_id: 1,
                author: 'test'
            },
            {
                id: 2,
                title: 'test',
                url: 'http://test',
                author_id: 2,
                author: 'test'
            }

        ];

        actions.fetchLatestPosts = sinon.spy();


        var user = {
            id: 1,
            name: 'tester'
        };
        var Component = StubRouterContext(Posts, {
            posts: posts,
            user: user,
            fetchPosts: function() {}
        });

        var component = TestUtils.renderIntoDocument(<Component />);

        // we should have 1 upvote link
        //

        var numUpvoteLinks = TestUtils.scryRenderedDOMComponentsWithClass(component, "glyphicon-arrow-up").length;
        expect(numUpvoteLinks).to.equal(1);

        // we should have 1 delete link

        var node = component.getDOMNode();
        var links = TestUtils.scryRenderedDOMComponentsWithTag(component, "a");
        var numDeleteLinks = _.filter(links, function(link) { 
            return link.props.children === 'delete'; 
        }).length;
        expect(numDeleteLinks).to.equal(1);


    });

});
