angular.module('filters', [])

  .filter('date', [function() {
    return function(str) {
      return str;
    };
  }])

  .filter('toTitleCase', [function() {
    return function(str) {
      return (str || '').charAt(0).toUpperCase()+(str || '').substr(1).replace(/[\s|_|-]([a-z])/g, function(s, m) {
        return ' ' + m.toUpperCase();
      });
    };
  }]);