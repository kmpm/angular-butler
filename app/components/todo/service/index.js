'use strict';

var app = require('angular').module('app.Todo');


app.service('TodoService', require('./todos'));
