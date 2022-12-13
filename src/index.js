import React from 'react';
import ReactDOM from 'react-dom';
import Root from './client/Root';
// import { unregister } from './registerServiceWorker';
import { AppContainer } from 'react-hot-loader';
import './reset.css';
// import './webfont.css';
import './common.css';
import './animation.css';
import './animationCotOpti.css';
import Core from "./supporters/core";
import appConfig from './config/app-config';
import Axios from 'axios';

window.core = Core.create();

if (!appConfig.runDevice) {
	import(/* webpackChunkName: 'webfont-css' */'./webfont.css')
	console.info = function () { };  // 로그 제거
}

// console.log = function () { };  // 로그 제거
// console.error = function () { };  // 로그 제거

// window.addEventListener('mousemove', function (e) {
// 	var x = e.pageX;
// 	var y = e.pageY;
// 	console.log(x, y);
// })

// ui 버전 표시 
// Axios.get('/ui5web/v5/version.txt').then(function (response) {
// this.testJson.list = response.data

// var localUrl = document.location.href.split(":")[1];
// document.getElementById('localver').innerHTML = localUrl + ' : 2018.0511.1740.b5aad2c';
// console.log('response=', response);
// });

const token = localStorage.getItem('devTokenKey');
if ( !token ) {
	localStorage.setItem('devTokenKey', '5c867a36-2e2e-4fed-93da-dbc65adcb7fe');
}
const currentHref = window.location.href;
const regExp = new RegExp(`${localStorage.getItem('devTokenKey')}`);
if ( !regExp.test(currentHref) ) {
	window.location.href = `${window.location.href}?${localStorage.getItem('devTokenKey')}`
}


const render = Component => {
	ReactDOM.render(
		<AppContainer>
			<Component />
		</AppContainer>,
		document.getElementById('root')
	)
}

render(Root)


if (module.hot) {
	module.hot.accept('./client/Root', () => { render(Root) })
}


// registerServiceWorker();
// unregister();