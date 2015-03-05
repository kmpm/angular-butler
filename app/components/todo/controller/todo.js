'use strict';

module.exports = function($scope, TodoService) {
  $scope.todo = TodoService.getTodos()[0];
  console.log('asdfasdf');
};
