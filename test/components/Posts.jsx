var React = require('react/addons'),
    Router = require('react-router'),
    Posts = require('../../client/components/Posts'),
    StubRouterContext = require('../StubRouterContext'),
    {expect} = require('chai'),
    _ = require('lodash'),
    TestUtils = React.addons.TestUtils;

describe('Login component', function() {
    it('should show delete button if user', function() {

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

        var user = {
            id: 1,
            name: 'tester'
        };
        var Component = StubRouterContext(Posts, {
            posts: posts,
            user: user,
            fetchPosts: function() {}
        });

        var node = TestUtils.renderIntoDocument(<Component />).getDOMNode();
        var ul = node.getElementsByTagName("ul")[0];
        var items = ul.getElementsByTagName("li");

        var getDeleteLinks = function(links) {
            return _.filter(links, function(link) {
                return link.textContent === 'delete';
            });
        };
        
        // item 1 should have 3 links: url, user, delete
        //

        var firstItemLinks = items[0].getElementsByTagName("a");
        expect(getDeleteLinks(firstItemLinks).length).to.equal(1);

        // item 2 should have just 2 links: url, user

        var secondItemLinks = items[1].getElementsByTagName("a");
        expect(getDeleteLinks(secondItemLinks).length).to.equal(0);

    });

});
