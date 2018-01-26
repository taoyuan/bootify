/* global describe, it, before, expect */

const initializers = require('../../lib/phases/initializers');

describe('phases/initializers', function () {

	it('should export a setup function', function () {
		expect(initializers).to.be.a('function');
	});

	describe('phase with string argument', function () {
		const app = new Object();
		app.order = [];

		let error;

		before(function (done) {
			global.__app = app;

			const phase = initializers(__dirname + '/../data/initializers/test');
			phase.call(app, function (err) {
				error = err;
				delete global.__app;
				return done();
			});
		});

		it('should call callback', function () {
			expect(error).to.be.undefined;
		});
		it('should run initializers in correct order', function () {
			expect(app.order).to.have.length(4);
			expect(app.order[0]).to.equal('01_async_begin');
			expect(app.order[1]).to.equal('02_sync');
			expect(app.order[2]).to.equal('03_require');
			expect(app.order[3]).to.equal('01_async_end');
		});
	});

	describe('phase with dirname option', function () {
		const app = new Object();
		app.order = [];

		let error;

		before(function (done) {
			const phase = initializers({dirname: __dirname + '/../data/initializers/test'});
			phase.call(app, function (err) {
				error = err;
				return done();
			});
		});

		it('should call callback', function () {
			expect(error).to.be.undefined;
		});
		it('should run initializers in correct order', function () {
			expect(app.order).to.have.length(3);
			expect(app.order[0]).to.equal('01_async_begin');
			expect(app.order[1]).to.equal('02_sync');
			expect(app.order[2]).to.equal('01_async_end');
		});
	});

	describe('phase with initializer that calls done with error', function () {
		const app = new Object();
		app.order = [];

		let error;

		before(function (done) {
			const phase = initializers(__dirname + '/../data/initializers/error-done');
			phase.call(app, function (err) {
				error = err;
				return done();
			});
		});

		it('should call callback', function () {
			expect(error).to.be.an.instanceOf(Error);
			expect(error.message).to.equal('something went wrong');
		});
		it('should halt initializers after error', function () {
			expect(app.order).to.have.length(0);
		});
	});

	describe('phase with initializer that throws exception', function () {
		const app = new Object();
		app.order = [];

		let error;

		before(function (done) {
			const phase = initializers(__dirname + '/../data/initializers/error-throw');
			phase.call(app, function (err) {
				error = err;
				return done();
			});
		});

		it('should call callback', function () {
			expect(error).to.be.an.instanceOf(Error);
			expect(error.message).to.equal('something went horribly wrong');
		});
		it('should halt initializers after error', function () {
			expect(app.order).to.have.length(0);
		});
	});

});
