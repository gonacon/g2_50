import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link } from 'react-router-dom';
import $ from 'jquery';
import { fnScrolling, radioFn, checkFn, popupScroll, selectFn, phoneNumFn, createMarkup, scrollUp, focusClass, registComplete, lastBlockFocus } from './UI';
import Moment from 'react-moment';
import 'moment/locale/ko';
Moment.globalLocale = "ko";
export {
    React, Component, ReactDOM, Router, Route, Link, 
    $, Moment,
    fnScrolling, radioFn, checkFn, popupScroll, selectFn, phoneNumFn, createMarkup, scrollUp, focusClass, registComplete, lastBlockFocus
}

export function lineBreak(value) {
    let itemText = value;

    if (itemText !== undefined) {
        itemText = itemText.split('\n').map( (line,i) => {
            return (<div key={i}>{line}</div>)
        });
    }

    return itemText;
}