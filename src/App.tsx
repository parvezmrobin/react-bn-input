import React, {lazy, Suspense} from 'react';
import ReactDOM from 'react-dom';
import './App.scss';
import * as serviceWorker from './serviceWorker';
const BnInput = lazy(() => import(/* webpackChunkName: "BnInput" */ "./BnInput"));

ReactDOM.render(
    <Suspense fallback={<h1>Loading</h1>}><BnInput autofocus/></Suspense>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
