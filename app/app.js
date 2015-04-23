import React from 'react';
import Router from 'react-router';
import Routes from './Routes';
import bootstrap from './bootstrap';

bootstrap(window.initData);

Router.run(Routes, Router.HistoryLocation, (Handler) => {
    React.render(<Handler />, document.body);
});

