module.exports = function(next) {
  process.nextTick(async () => {
    this.order.push('01_async_begin');
    await next();
		this.order.push('01_async_end');
  });
};
