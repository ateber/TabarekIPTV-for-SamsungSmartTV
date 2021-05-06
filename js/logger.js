'use strict';

var Logger = (function() {

  var element;
  var maxLines = 16;
  
  var Logger = function(name) {
    if (!element) element = document.getElementById('log');
    return function() {
      var lines = [].slice.call(element.children).length;
      var args = [].slice.call(arguments);
      element.innerHTML += '<p>[' + name + '] ' + args.join(' ') + '</p>';
      element.scrollTop = element.scrollHeight;
      if (lines >= maxLines) element.removeChild(element.firstChild);
      console.log('[' + name + '] ', args);
    }
  };

  return Logger;

}());
