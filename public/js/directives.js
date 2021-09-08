angular.module('directives', [])

  // Google analytics tracking
  .directive('track', [function() {
    return {
      scope: {
        data: '=track'
      },
      link: function(scope, element, attrs) {
        var evt = scope.data[0];

        element.on(evt, function() {
          ga.apply(ga, ['send', 'event'].concat(scope.data.slice(1)));
        });
      }
    };
  }])

  .directive('paralax', [function() {
    return {
      link: function(scope, element, attrs) {
        var $img = $('<img src="' + attrs.paralax + '" class="paralax-img" />'),
          elHeight = element.height(),
          y = element.offset().top + 71,
          imgHeight = 100;

        function resize() {
          $img.width($(window).width());
        }

        resize();

        $img.on('load', function() {
          imgHeight = $img.height();
          $img.css('margin-top', (imgHeight - elHeight) / -2 + 'px');
        });

        element.addClass('paralax black');
        element.append($img);

        $(window)
          .on('resize', resize)
          .on('scroll', function(evt) {
            var bottomEdge = $(window).scrollTop() + $(window).height(),
              scrollRelative = bottomEdge - y;
            $img.css({
              top: scrollRelative / 2 - element.height() + 'px'
            });
          });
      }
    };
  }])

  .directive('animateCollide', [function() {
    return {
      link: function(scope, element, attrs) {
        var $img = element.find('.highlight-img'),
          $box = element.find('.highlight-box'),
          y = element.offset().top + 170,
          complete = false;

        $img.css({
          'margin-left': '-100px',
          opacity: 0
        });
        $box.css({
          'margin-left': '200px',
          opacity: 0
        });

        $(window).on('scroll', function() {
          var bottomEdge = $(window).scrollTop() + $(window).height();
          if (bottomEdge > y && !complete) {
            $img.animate({
              'margin-left': '0px',
              opacity: 1
            }, 600);
            $box.animate({
              'margin-left': '0px',
              opacity: 1
            }, 600);
            complete = true;
          }
        });
      }
    };
  }])

  .directive('animateFade', [function() {
    return {
      link: function(scope, element, attrs) {
        var $img = element.find('.highlight-img'),
          $box = element.find('.highlight-box'),
          y = element.offset().top + 170,
          complete = false;

        $img.css({
          opacity: 0
        });
        $box.css({
          opacity: 0
        });

        $(window).on('scroll', function() {
          var bottomEdge = $(window).scrollTop() + $(window).height();
          if (bottomEdge > y && !complete) {
            $img.animate({
              opacity: 1
            }, 600);
            $box.animate({
              opacity: 1
            }, 600);
            complete = true;
          }
        });
      }
    };
  }])

  .directive('isSelected', ['$location', function($location) {
    return {
      scope: {
        match: '=isSelected'
      },
      link: function(scope, element, attrs) {
        var segment, selected;
        scope.$watch(function() { return $location.path(); }, function(path) {
          if (scope.match) {
            // not working
            segment = [].slice.apply(path.split(/\//g), scope.match).join('/');
          }
          selected = path === (attrs.href || attrs.ngHref).substr(2);
          element.toggleClass('selected', selected);
        });
      }
    };
  }])

  .directive('drag', ['$document', '$rootScope', '$timeout', function($document, $rootScope, $timeout) {
    return {
      scope: {
        item: '=drag'
      },
      link: function(scope, element, attrs) {
        var startX = 0,
          startY = 0,
          x = 0,
          y = 0,
          clone;

        element.on('mousedown', function(evt) {
          // Prevt default dragging of selected content
          evt.preventDefault();
          evt.stopPropagation();

          clone = element.clone();
          element.addClass('dragging-original');
          clone.addClass('dragging');
          element.parent().prepend(clone);
          startX = evt.clientX;
          startY = evt.clientY;
          mousemove(evt);
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
          $timeout(function() {
            $rootScope.$dragging = scope.item;
          });
        });

        function mousemove(evt) {
          y = evt.clientY;
          x = evt.clientX;
          clone.css({
            top: y + 20 + 'px',
            left:  x + 20 + 'px'
          });
        }

        function mouseup() {
          clone.remove();
          element.removeClass('dragging-original');
          clone = undefined;
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
          $timeout(function() {
            $rootScope.$dragging = undefined;
          });
        }
      }
    };
  }])

  .directive('drop', ['$rootScope', function($rootScope) {
    return {
      scope: {
        dropFn: '&drop'
      },
      link: function(scope, element, attrs) {
        element.on('mouseenter', function() {
          element.addClass('hover');
        });
        element.on('mouseleave', function() {
          element.removeClass('hover');
        });
        element.on('mouseup', function(evt) {
          scope.dropFn({item: $rootScope.$dragging});
        });
      }
    };
  }])

  .directive('focusInput', [function() {
    return {
      link: function(scope, element, attrs) {
        element.focus();
      }
    };
  }])

  .directive('stopProp', [function() {
    return {
      link: function(scope, element, attrs) {
        element.on('click mousedown mouseup', function(evt) {
          evt.stopPropagation();
        });
      }
    };
  }]);