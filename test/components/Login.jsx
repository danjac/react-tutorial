import React from 'react/addons';
import Router from 'react-router';
import sinon from 'sinon';
import moment from 'moment';
import {expect} from 'chai';
import _ from 'lodash';
import Login from '../../client/components/Login';
import StubRouterContext from '../StubRouterContext';

const TestUtils = React.addons.TestUtils;

describe("Login component", () => {

    it('should trigger the login action on submit', () => {

        const Component = StubRouterContext(Login);
        const component = TestUtils.renderIntoDocument(<Component />);
        const refs = component._renderedComponent.refs;
        const identity = refs.identity.getInputDOMNode();

        TestUtils.Simulate.change(identity, {target: {value: 'test@gmail.com'}});
        //TestUtils.Simulate.input(refs.password, {target: {value: 'testing'}});

        const form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
        TestUtils.Simulate.submit(form);


    });

});

