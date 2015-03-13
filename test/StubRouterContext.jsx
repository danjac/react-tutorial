import React from 'react';
import _ from 'lodash';
  
const func = React.PropTypes.func;

export default function(Component, props, stubs){

  return React.createClass({

    childContextTypes: {
      makePath: func,
      makeHref: func,
      transitionTo: func,
      replaceWith: func,
      goBack: func,
      getCurrentPath: func,
      getCurrentRoutes: func,
      getCurrentPathname: func,
      getCurrentParams: func,
      getCurrentQuery: func,
      isActive: func
    },

    getChildContext() {
        return _.assign({
            makePath: () => {},
            makeHref: () => {},
            transitionTo: () => {},
            replaceWith: () => {},
            goBack: () => {},
            getCurrentPath: () => {},
            getCurrentRoutes: () => {},
            getCurrentPathname: () => {},
            getCurrentParams: () => {},
            getCurrentQuery: () => {},
            isActive: () => {}
      }, stubs);
    },

    render() {
        return <Component {...props} />;
    }
  });
};
