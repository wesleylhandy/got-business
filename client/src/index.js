import './vendors'
import Promise from 'promise-polyfill';

import React from 'react';
import * as ReactDOM from 'react-dom';

import App from './Components/App'

if (!window.Promise) {
    window.Promise = Promise;
}

const rootEntry = document.getElementById('app-root')

ReactDOM.render(<App/>, rootEntry);