angular.module('app/mdCarousel', [])

  .directive('mdCarousel', ['$window', '$timeout', function($window, $timeout) {
    return {
      template: [
        '<img class="image test1" data-ng-hide="!loaded" data-ng-src="{{imgSrc(current.img)}}" data-ng-style="{width: width, top: imgTop, \'margin-top\': imgMarginTop}" data-fade="current.title">',
        '<div class="screen" data-ng-style="{height: height}"></div>',
        '<div class="icon-tray">',
          '<i class="carousel-icon fa" data-ng-class="icon.icon + selected(icon)" title="{{icon.title}}" data-ng-repeat="icon in data" data-ng-click="select(icon)"></i>',
        '</div>',
        '<div class="container">',
          '<div class="content" data-ng-style="{\'margin-top\': contentTop}">',
            '<i class="fa fa-angle-right right" data-ng-click="right()"></i>',
            '<i class="fa fa-angle-left left" data-ng-click="left()"></i>',
            '<div class="title" data-ng-bind="current.title" data-ticker="current.title" data-delta="delta"></div>',
            '<a class="btn more-button" data-ng-href="{{href()}}">Learn more</a>',
          '</div>',
        '</div>'
      ].join(''),
      scope: {
        data: '=mdCarousel',
        timeout: '=',
        scroll: '='
      },
      link: function(scope, element, attrs) {
        var $moreButton = element.find('.more-button'),
          $img = element.find('.image'),
          idx = 0,
          scrollSpeed = scope.scroll ? scope.scroll * 1000 : 500,
          interval,
          currentStep = 0;

        element.addClass('carousel');

        scope.current = scope.data[idx];

        scope.selected = function(icon) {
          return icon.$$hashKey === scope.current.$$hashKey ? ' selected' : '';
        };

        scope.right = function() {
          scope.slide(1);
          clearInterval(interval);
        };
        scope.left = function() {
          scope.slide(-1);
          clearInterval(interval);
        };

        scope.slide = function(delta) {
          currentStep = 0;
          idx += (scope.delta = +delta ? delta : 1);
          if (idx < 0) idx = scope.data.length - 1;
          else if (idx >= scope.data.length) idx = 0;
          scope.current = scope.data[idx];
        };

        scope.step = function() {
          var steps = +scope.current.steps ? scope.current.steps : 1;
          if (++currentStep >= steps) {
            scope.slide(1);
          }
        };

        scope.select = function(icon) {
          idx = scope.data.findIndex(function(i) {
            return i.title === icon.title;
          });
          scope.current = icon;
          interval && clearInterval(interval);
        };

        if (scope.timeout) {
          currentStep = 0;
          interval = setInterval(function() {
            scope.$apply(scope.step);
          }, scope.timeout * 1000);
        }

        scope.href = function() {
          if (scope.current.link.charAt(0) === '#') {
            $moreButton.off('click');
            $moreButton.on('click', function() {
              var top = $(scope.current.link).offset().top;
              $('body, html').scrollTop(Math.max(top - 1200, $('body, html').scrollTop()));
              $('body, html').animate({ scrollTop: top - 58 + 'px' }, scrollSpeed);
            });
            return '';
          } else {
            $moreButton.off('click');
            return MD.root + '/' + scope.current.link;
          }
        };

        scope.imgSrc = function(img) {
          return MD.root + 'img/slideshow/' + img;
        };

        function resize() {
          var height = $(window).height() - 87;
          scope.width = $(window).width() + 'px';
          scope.contentTop = (height - 160) / 2 + 'px';
          element.height(height);

          $timeout(function() {
            scope.imgTop = ($img.height() - height) / -2 + 'px';
          });
        }

        $($window)
          .on('resize', function() {
            scope.$apply(resize);
          })
          .on('scroll', function(evt) {
            scope.$apply(function() {
              scope.imgMarginTop = $(window).scrollTop() / 3 + 'px';
            });
          });

        scope.data.forEach(function(item, idx) {
          var i = new Image();
          i.src = scope.imgSrc(item.img);
          if (!idx) {
            i.onload = function() {
              scope.loaded = true;
              scope.$apply(resize);
            };
          }
        });

      }
    };
  }])

  .directive('ticker', ['$animate', function($animate) {
    return {
      scope: {
        content: '=ticker',
        delta: '='
      },
      link: function(scope, element, attrs) {
        scope.$watch('content', function(content) {
          if (scope.delta) {
            element.css({ 'margin-left': 300 * scope.delta + 'px' })
              .stop(true)
              .animate({ 'margin-left': '0px', opacity: 1 }, 200);
          }
        });
      }
    };
  }])

  .directive('fade', [function() {
    return {
      scope: {
        content: '=fade'
      },
      link: function(scope, element, attrs) {
        scope.$watch('content', function(content) {
          element.css({ opacity: .5, 'margin-top': '-=20' })
            .stop(true)
            .animate({ opacity: 1, 'margin-top': '+=20' }, 700);
        });
      }
    };
  }]);

