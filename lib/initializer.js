/**
 * Module dependencies.
 */

// const debug = require('debug')('bootify');


/**
 * Creates an instance of `Initializer`.
 *
 * @constructor
 * @api public
 */
function Initializer() {
	this._phases = [];
}

/**
 * Run all phases.
 *
 * When the initializer is run, all phases will be executed sequentially, in
 * the order in which they were registered.  Once complete, `cb` will be
 * invoked.
 *
 * @param {Function|Object} [cb]
 * @param {Object} [thisArg]
 * @api public
 */
Initializer.prototype.run = async function (cb, thisArg) {
	if (typeof cb !== 'function') {
		thisArg = cb;
		cb = null;
	}

	const phases = this._phases;
	let idx = 0;

	async function next(err) {
		if (err) {
			if (cb) return cb(err);
			throw err;
		}
		const phase = phases[idx++];
		// all done
		if (!phase) {
			if (cb) return cb();
			return;
		}

		try {
			if (typeof phase === 'object') {
				// debug('%s', phase.constructor ? phase.constructor.name + '#boot' : 'anonymous#boot');
				await phase.boot(next);
			} else {
				// debug('%s', phase.name || 'anonymous');
				const arity = phase.length;
				if (arity === 1) {
					await phase.call(thisArg, next);
				} else {
					await phase.call(thisArg);
					await next();
				}
			}
		} catch (ex) {
			await next(ex);
		}
	}

	await next();
};

/**
 * Register a phase.
 *
 * A phase can be either synchronous or asynchronous.  Synchronous phases have
 * following function signature
 *
 *     function myPhase() {
 *       // perform initialization
 *     }
 *
 * Asynchronous phases have the following function signature.
 *
 *     function myAsyncPhase(done) {
 *       // perform initialization
 *       done();  // or done(err);
 *     }
 *
 * The phase may also be an object that has a `boot` function.  In this case,
 * the object's boot function will be called during the boot sequence.  This is
 * typically used for objects that need to establish a persistent connection,
 * for example to a database or message queue.
 *
 * @param {Function|Object} fn
 * @returns {Initializer} `this`, for a fluent interface.
 * @api public
 */
Initializer.prototype.phase = function (fn) {
	this._phases.push(fn);
	return this;
};


/**
 * Expose `Initializer`.
 */
module.exports = Initializer;
