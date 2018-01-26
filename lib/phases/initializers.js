const path = require('path');
const fs = require('fs');
const existsSync = fs.existsSync || path.existsSync; // node <=0.6
const debug = require('debug')('bootify');


/**
 * Initializer execution phase.
 *
 * This phase will execute all initializer scripts in a directory, allowing the
 * application to initialize modules, including connecting to databases and
 * other network services.
 *
 * Examples:
 *
 *   app.phase(bootable.initializers());
 *
 *   app.phase(bootable.initializers('config/initializers'));
 *
 * @param {String|Object} options
 * @return {Function}
 * @api public
 */
module.exports = function (options) {
	if ('string' === typeof options) {
		options = {dirname: options};
	}
	options = options || {};
	const dirname = options.dirname || 'etc/init';
	const extensions = options.extensions || Object.keys(require.extensions).map(function (ext) {
		return ext;
	});
	const exts = extensions.map(function (ext) {
		if ('.' !== ext[0]) {
			return ext;
		}
		return ext.slice(1);
	});

	const regex = new RegExp('\\.(' + exts.join('|') + ')$');

	return async function initializers(done) {
		const dir = path.resolve(dirname);
		if (!existsSync(dir)) {
			return done();
		}

		const that = this;
		const files = fs.readdirSync(dir).sort();
		let idx = 0;

		async function next(err) {
			if (err) {
				return done(err);
			}

			const file = files[idx++];
			// all done
			if (!file) {
				return done();
			}

			if (regex.test(file)) {
				try {
					debug('initializer %s', file);
					const mod = require(path.join(dir, file));
					if (typeof mod === 'function') {
						const arity = mod.length;
						if (arity === 1) {
							// Async initializer.  Exported function will be invoked, with next
							// being called when the initializer finishes.
							await mod.call(that, next);
						} else {
							// Sync initializer.  Exported function will be invoked, with next
							// being called immediately.
							await mod.call(that);
							await next();
						}
					} else {
						// Initializer does not export a function.  Requiring the initializer
						// is sufficient to invoke it, next immediately.
						await next();
					}
				} catch (ex) {
					await next(ex);
				}
			} else {
				await next();
			}
		}

		await next();
	};
};
