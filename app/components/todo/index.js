'use strict';

var angular = require('angular');
var app = module.exports = angular.module('app.Todo', []);

app.config(function($routeProvider) {
  console.log('config todo');
  $routeProvider.when('/todos', {
    templateUrl: 'components/todo/views/todos.html',
    controller: 'TodoCtrl',
  });

});


require('./service');
require('./controller');
