angular.module('factories', [])

  .factory('Emitter', [
    function() {
      var id = 0,
        listeners = {};

      function uid() {
        return id++;
      }

      function unbind(evt, id) {
        return function() {
          var index;
          listeners[evt].forEach(function(callbackFn, idx) {
            if (callbackFn.$id === id) {
              index = idx;
            }
          });
          listeners[evt].splice(index, 1);
        };
      }

      function emitChain(evt, data, originalEvent) {
        var evtChain = evt.split('.');
        evtChain.pop();

        if (listeners[evt]) {
          listeners[evt].forEach(function(callbackFn) {
            callbackFn(data, originalEvent);
          });
        }

        if (evtChain.length) {
          emitChain(evtChain.join('.'), data, originalEvent);
        }
      }

      return Emitter = {
        on: function on(evt, callbackFn) {
          listeners[evt] = listeners[evt] || [];
          callbackFn.$id = uid();
          listeners[evt].push(callbackFn);
          return unbind(evt, callbackFn.$id);
        },
        emit: function emit(evt, data) {
          emitChain(evt, data, evt);
        }
      };
    }
  ]);