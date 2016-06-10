/**
 * Module dependencies.
 */
var Initializer = require('./initializer');


/**
 * Make `app` bootify.
 *
 * This function makes an application bootify.  Booting consists of executing
 * a sequence of phases to initialize the application.
 *
 * Examples:
 *
 *     var app = bootify(express());
 *     app.phase(bootify.initializers());
 *     app.phase(bootify.routes());
 *
 *     app.boot(function(err) {
 *       if (err) { throw err; }
 *       app.listen(3001);
 *     });
 *
 * @param {Object} app
 * @returns {Object} app
 * @api public
 */
exports = module.exports = function(app, phases) {
  phases = [].slice.call(arguments, 1);
  
  // Mixin initializer.
  app._initializer = new Initializer();
  
  /**
   * Boot application.
   *
   * @param {Function} cb
   * @param {Object} [thisArg]
   * @api public
   */
  app.boot = function(cb, thisArg) {
    this._initializer.run(cb, thisArg || this);
  };
  
  /**
   * Add phase to boot sequence.
   *
   * @param {Function} fn
   * @return {Object} for chaining
   * @api public
   */
  app.phase = function(fn) {
    this._initializer.phase(fn);
    return this;
  };
  
  // Register phases, if any.
  for (var i = 0; i < phases.length; ++i) {
    app.phase(phases[i]);
  }
  return app;
};


/**
 * Export constructors.
 */
exports.Initializer = Initializer;