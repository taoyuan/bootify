# Bootify

[![Build](https://travis-ci.org/taoyuan/bootify.png)](https://travis-ci.org/taoyuan/bootify)
[![Coverage](https://coveralls.io/repos/taoyuan/bootify/badge.png)](https://coveralls.io/r/taoyuan/bootify)
[![Quality](https://codeclimate.com/github/taoyuan/bootify.png)](https://codeclimate.com/github/taoyuan/bootify)
[![Dependencies](https://david-dm.org/taoyuan/bootify.png)](https://david-dm.org/taoyuan/bootify)


Bootify is an extensible initialization layer for [Node.js](http://nodejs.org/) and browser applications
forked from jaredhanson/bootable.

Bootify allows initialization *phases* to be registered for an application.
These phases will be executed sequentially during startup, after which the
application will be ready to run.

## Install

    $ npm install bootify

## Usage

Bootify is generally applicable to any Node.js application or application
framework.  [Express](http://expressjs.com/) will be used below, for
illustrative purposes, as it is the most popular way of developing web
applications.

#### Mixin Bootify

Create a new application and mixin the bootify module.

```javascript
var express = require('express')
  , bootify = require('bootify');

var app = bootify(express());
```

Once mixed-in, the application will have two additional functions: `app.boot`
and `app.phase`.

#### Register Phases

An application proceeds through a sequence of phases, in order to prepare
itself to handle requests.  Modules need to be configured, databases need to be
connected, and routes need to be drawn.

Bootify packages phases for these common scenarios:

```javascript
app.phase(bootify.initializers('config/initializers'));
app.phase(bootify.routes('routes.js'));
```

Custom phases can be registered as well, and come in synchronous and
asynchronous flavors:

```
app.phase(function() {
  // synchronous phase
});

app.phase(function(done) {
  setTimeout(function() {
    // asynchronous phase
    done();
  }, 1000);
});
```

#### Boot Application

Call `app.boot` with a callback to boot your application.  Phases will be
executed sequentially, and the callback will be invoked when all phases are
complete.

```
app.boot(function(err) {
  if (err) { throw err; }
  app.listen(3000);
});
```

This allows you to split off your initialization steps into separate, organized
and reusable chunks of logic.

## Tests

    $ npm install
    $ npm test

## Credits

  - [Yuan Tao](http://github.com/taoyuan)
  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2016 Yuan Tao <[http://github.com/taoyuan](http://github.com/taoyuan)>
Copyright (c) 2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
