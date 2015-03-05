'use strict';

var app = require('angular').module('app.Todo');

app.controller('EditTodoCtrl', require('./edit_todo'));
app.controller('TodoCtrl', require('./todo'));
app.controller('TodoListCtrl', require('./todo_list'));
