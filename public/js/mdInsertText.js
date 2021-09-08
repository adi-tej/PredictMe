angular.module('app/mdInsertText', [])

  .directive('mdInsertText', ['$timeout', function($timeout) {
    return {
      template: 
        '{{renderedText}}',
      scope: {
        data: '=mdInsertText'
      },
      link: function(scope, element, attrs) {
        scope.renderedText = ({
          email: scope.data[1] + '@' + scope.data[2]
        })[scope.data[0]];
      }
    };
  }]);