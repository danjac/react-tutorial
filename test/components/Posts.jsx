import React from 'react/addons';
import Router from 'react-router';
import sinon from 'sinon';
import moment from 'moment';
import {expect} from 'chai';
import _ from 'lodash';
import Immutable from 'immutable';
import Posts from '../../client/components/Posts';
import StubRouterContext from '../StubRouterContext';

const TestUtils = React.addons.TestUtils;

describe('Posts component', () => {

    it('should show no buttons for an anonymous user', () => {
        const posts = Immutable.List([
            {
                id: 1,
                title: 'test',
                url: 'http://test',
                author_id: 1,
                author: 'test',
                created_at: moment.utc()
            }
        ]);

        const Component = StubRouterContext(Posts, {
            posts: posts,
            user: null,
            total: 1,
            isFirst: true,
            isLast: true,
            isServer: true,
            fetchPosts: () => {}
        });

        const component = TestUtils.renderIntoDocument(<Component />);

        const numUpvoteLinks = TestUtils.scryRenderedDOMComponentsWithClass(component, "glyphicon-arrow-up").length;
        expect(numUpvoteLinks).to.equal(0);

        // we should have 1 delete link

        const node = component.getDOMNode();
        const links = TestUtils.scryRenderedDOMComponentsWithTag(component, "a");
        const numDeleteLinks = links.filter((link) => link.props.children === 'delete').length;

        expect(numDeleteLinks).to.equal(0);
 
    });

    it('should show correct buttons for a user', () => {
        const posts = Immutable.List([
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

        const user = {
            id: 1,
            name: 'tester'
        };
        const Component = StubRouterContext(Posts, {
            posts: posts,
            user: user,
            total: 2,
            isFirst: true,
            isLast: true,
            isServer: true,
            fetchPosts: () => {}
        });

        const component = TestUtils.renderIntoDocument(<Component />);

        // we should have 1 upvote link
        //

        const numUpvoteLinks = TestUtils.scryRenderedDOMComponentsWithClass(component, "glyphicon-arrow-up").length;
        expect(numUpvoteLinks).to.equal(1);

        // we should have 1 delete link

        const node = component.getDOMNode();
        const links = TestUtils.scryRenderedDOMComponentsWithTag(component, "a");
        const numDeleteLinks = links.filter((link) => link.props.children === 'delete').length;
        expect(numDeleteLinks).to.equal(1);

    });

});
