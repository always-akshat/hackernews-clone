/**
 * Created by akshat on 5/9/15.
 */

/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var passport = require('passport');

module.exports = function(app) {
    var env = app.get('env');
    app.set('views', config.root + '/public/views');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(compression());
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(passport.initialize());
    console.log(path.join(config.root, 'public'));
    //  app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', 'public');
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
};
