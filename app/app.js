'use strict';

require('es5-shim');
require('es5-sham');

require('jquery');
var angular = require('angular');
require('angular-route');

var app = angular.module('app', [ 'ngRoute', 'app.Todo']);

app.constant('VERSION', require('../package.json').version);

require('./shared');
require('./components');

app.config(function($routeProvider) {

  $routeProvider.when('/', {
    templateUrl: 'shared/views/home.html',
    controller: 'HomeCtrl'
  })
  .when('/imprint', {
    templateUrl: 'shared/views/imprint.html',
    controller: 'ImprintCtrl',
  })
  .otherwise({
    redirectTo: '/'
  });
});
