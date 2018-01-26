/* global describe, it, expect */

var bootify = require('..');

describe('bootify', function () {

	it('should export function', function () {
		expect(bootify).to.be.a('function');
	});

	it('should export Initializer constructor', function () {
		expect(bootify.Initializer).to.be.a('function');
	});

});
