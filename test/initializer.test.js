/* global describe, it, before, expect */

const Initializer = require('../lib/initializer');

describe('Initializer', function() {

  describe('without phases', function() {
    const initializer = new Initializer();
    let error;

    before(async function() {
      await initializer.run();
    });

    it('should call callback', function() {
      expect(error).to.be.undefined;
    });
  });

  describe('with sync phase', function() {

    describe('run without context', function() {
      const initializer = new Initializer()
        , order = [];
      initializer.phase(function() {
        const name = this !== global ? this.name : 'global';
        order.push('1:' + name);
      });

      let error;

      before(function(done) {
        initializer.run(function(err) {
          error = err;
          return done();
        });
      });

      it('should call callback', function() {
        expect(error).to.be.undefined;
      });
      it('should run phases in correct order', function() {
        expect(order).to.have.length(1);
        expect(order[0]).to.equal('1:global');
      });
    });

    describe('run with context', function() {
      const initializer = new Initializer()
        , ctx = { name: 'local' }
        , order = [];
      initializer.phase(function() {
        const name = this !== global ? this.name : 'global';
        order.push('1:' + name);
      });

      let error;

      before(function(done) {
        initializer.run(function(err) {
          error = err;
          return done();
        }, ctx);
      });

      it('should call callback', function() {
        expect(error).to.be.undefined;
      });
      it('should run phases in correct order', function() {
        expect(order).to.have.length(1);
        expect(order[0]).to.equal('1:local');
      });
    });

    describe('that throws an exception', function() {
      const initializer = new Initializer();
      initializer.phase(function() {
        throw new Error('something went horribly wrong');
      });

      let error;

      before(async function() {
        await initializer.run(function(err) {
          error = err;
        });
      });

      it('should call callback with error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('something went horribly wrong');
      });
    });

  });

  describe('with async phase', function() {

    describe('run without context', function() {
      const initializer = new Initializer()
        , order = [];
      initializer.phase(function(done) {
        const self = this;
        process.nextTick(function() {
          const name = self !== global ? self.name : 'global';
          order.push('1:' + name);
          return done();
        });
      });

      let error;

      before(function(done) {
        initializer.run(function(err) {
          error = err;
          return done();
        });
      });

      it('should call callback', function() {
        expect(error).to.be.undefined;
      });
      it('should run phases in correct order', function() {
        expect(order).to.have.length(1);
        expect(order[0]).to.equal('1:global');
      });
    });

    describe('run with context', function() {
      const initializer = new Initializer()
        , ctx = { name: 'local' }
        , order = [];
      initializer.phase(function(done) {
        const self = this;
        process.nextTick(function() {
          const name = self !== global ? self.name : 'global';
          order.push('1:' + name);
          return done();
        });
      });

      let error;

      before(function(done) {
        initializer.run(function(err) {
          error = err;
          return done();
        }, ctx);
      });

      it('should call callback', function() {
        expect(error).to.be.undefined;
      });
      it('should run phases in correct order', function() {
        expect(order).to.have.length(1);
        expect(order[0]).to.equal('1:local');
      });
    });

    describe('that calls done with error', function() {
      const initializer = new Initializer();
      initializer.phase(function(done) {
        process.nextTick(function() {
          return done(new Error('something went wrong'));
        });
      });

      let error;

      before(function(done) {
        initializer.run(function(err) {
          error = err;
          return done();
        });
      });

      it('should call callback with error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('something went wrong');
      });
    });

    describe('that throws an exception', function() {
      const initializer = new Initializer();
      initializer.phase(function(done) {
        throw new Error('something went horribly wrong');
      });

      let error;

      before(function(done) {
        initializer.run(function(err) {
          error = err;
          return done();
        });
      });

      it('should call callback with error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('something went horribly wrong');
      });
    });

  });

  describe('multiple phases', function() {

    describe('that complete successfully', function() {
      const initializer = new Initializer()
        , order = [];
      initializer.phase(function() {
        const name = this !== global ? this.name : 'global';
        order.push('1:' + name);
      });
      initializer.phase(function(done) {
        const self = this;
        process.nextTick(function() {
          const name = self !== global ? self.name : 'global';
          order.push('2:' + name);
          return done();
        });
      });
      initializer.phase(function() {
        const name = this !== global ? this.name : 'global';
        order.push('3:' + name);
      });

      let error;

      before(function(done) {
        initializer.run(function(err) {
          error = err;
          return done();
        });
      });

      it('should call callback', function() {
        expect(error).to.be.undefined;
      });
      it('should run phases in correct order', function() {
        expect(order).to.have.length(3);
        expect(order[0]).to.equal('1:global');
        expect(order[1]).to.equal('2:global');
        expect(order[2]).to.equal('3:global');
      });
    });

    describe('that halt due to error', function() {
      const initializer = new Initializer()
        , order = [];
      initializer.phase(function() {
        const name = this !== global ? this.name : 'global';
        order.push('1:' + name);
      });
      initializer.phase(function(done) {
        process.nextTick(function() {
          return done(new Error('something went wrong'));
        });
      });
      initializer.phase(function() {
        const name = this !== global ? this.name : 'global';
        order.push('3:' + name);
      });

      let error;

      before(function(done) {
        initializer.run(function(err) {
          error = err;
          return done();
        });
      });

      it('should call callback with error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('something went wrong');
      });
      it('should run phases in correct order', function() {
        expect(order).to.have.length(1);
        expect(order[0]).to.equal('1:global');
      });
    });

  });

});
