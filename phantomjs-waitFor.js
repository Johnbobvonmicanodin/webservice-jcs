var async = require('async');

module.exports = waitFor;

/**
 * waitFor port used with 
 * @see    {@link https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js}
 * @see    {@link https://github.com/sgentle/phantomjs-node}
 * @callback testFx - Test function, will repeat until true or timeout limit is reached
 * @callback onReady - Fires if/when `testFx` passes.
 * @param {(number|boolean|string)} [timeOut=false] - If defined and falsey or string value of`forever` 
 *                                                    then `waitFor` will run until `testFx` passes without 
 *                                                    timing out, otherwise pass a number in miliseconds.
 */
function waitFor(testFx, onReady, timeOut) {

  var maxtimeOutMillis = typeof timeOut !== 'undefined' ? timeOut : 5000 // Default Max Timout is 5s if not defined
    , start = new Date().getTime()
    , isAsync = testFx.length > 0
    , passing = undefined
  ;

  async.until(
    function Test() { 
      return typeof passing !== 'undefined'; 
    },
    function Action(cb) {
      setTimeout(function(){

        if (!maxtimeOutMillis || maxtimeOutMillis == 'forever' || new Date().getTime() - start < maxtimeOutMillis) {

          // If a callback is passed to `testFx` we'll handle that.
          function useCallback(){
            passing = arguments[0]
            return cb();
          };                    

          passing = (function(){
            return (typeof(testFx) === "string" ? eval(testFx) : testFx).apply(this, arguments);
          })(isAsync ? useCallback : undefined);

          if(!isAsync) cb();

        } else {
          return cb(new Error('`waitFor` timeout'));
        }

      }, 250);
    },
    function Done(err) {
      return (function(){
        return (typeof(onReady) === "string" ? eval(onReady) : onReady).apply(this, arguments);                  
      })(err, passing);
    }
  );

}