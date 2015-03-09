// https://github.com/jesstelford/react-testing-mocha-jsdom/blob/master/test/setup.js
var jsdom = require('jsdom');

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.parentWindow;
