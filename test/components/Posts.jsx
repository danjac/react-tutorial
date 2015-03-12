var React = require('react/addons'),
    Router = require('react-router'),
    sinon = require('sinon'),
    moment = require('moment'),
    {expect} = require('chai'),
    _ = require('lodash'),
    Immutable = require('immutable'),
    TestUtils = React.addons.TestUtils,
    Posts = require('../../client/components/Posts'),
    StubRouterContext = require('../StubRouterContext');

describe('Posts component', function() {

    it('should show no buttons for an anonymous user', function(){
        var posts = Immutable.List([
            {
                id: 1,
                title: 'test',
                url: 'http://test',
                author_id: 1,
                author: 'test',
                created_at: moment.utc()
            }
        ]);

        var Component = StubRouterContext(Posts, {
            posts: posts,
            user: null,
            total: 1,
            isFirst: true,
            isLast: true,
            isServer: true,
            fetchPosts: function() {}
        });

        var component = TestUtils.renderIntoDocument(<Component />);

        var numUpvoteLinks = TestUtils.scryRenderedDOMComponentsWithClass(component, "glyphicon-arrow-up").length;
        expect(numUpvoteLinks).to.equal(0);

        // we should have 1 delete link

        var node = component.getDOMNode();
        var links = TestUtils.scryRenderedDOMComponentsWithTag(component, "a");
        var numDeleteLinks = _.filter(links, function(link) { 
            return link.props.children === 'delete'; 
        }).length;
        expect(numDeleteLinks).to.equal(0);
 
    });

    it('should show correct buttons for a user', function() {
        var posts = Immutable.List([
            {
                id: 1,
                title: 'test',
                url: 'http://test',
                author_id: 1,
                created_at: moment.utc(),
                author: 'test'
            },
            {
                id: 2,
                title: 'test',
                url: 'http://test',
                author_id: 2,
                created_at: moment.utc(),
                author: 'test'
            }

        ]);

        var user = {
            id: 1,
            name: 'tester'
        };
        var Component = StubRouterContext(Posts, {
            posts: posts,
            user: user,
            total: 2,
            isFirst: true,
            isLast: true,
            isServer: true,
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
