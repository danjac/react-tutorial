import React from 'react';
import Router from 'react-router';
import Routes from './Routes';

Router.run(Routes, Router.HistoryLocation, (Handler) => {
    React.render(<Handler />, document.body);
});