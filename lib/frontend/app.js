import React from 'react';
import Router from 'react-router';
import Routes from './Routes';

const data = JSON.parse(document.getElementById("initData").innerHTML);

Router.run(Routes, Router.HistoryLocation, (Handler) => {
    React.render(<Handler { ...data}/>, document.body);
});
