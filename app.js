var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
//[MJB]added f or socket.io. based on info found on http://stackoverflow.com/questions/24609991/using-socket-io-in-express-4-and-express-generators-bin-www
var socket_io = require( "socket.io" );


var logger = require('./utils/logFactory').getLogger();
logger.debug('Launching server...');
//Express
var app = express();

//var routes = require('./routes/index');


// [MJB] Added for Socket.io
var io = socket_io();
app.io = io;
var routes = require('./routes/index')(io);

//custom namespace
var ioLoader = io.of('/json-loader');
app.ioLoader = ioLoader;

// view engine setup >> MJB: IN MY CASE NO VIEW ENGINE, JUST PLANE STATIC HTML
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
var users = require('./routes/users');
app.use('/users', users);
var files = require('./routes/files');
app.use('/files/', files);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/**
 * load images at start
 * @type {*}
 */
var imageService = require('./services/imageService');
imageService.loadImagesOnStart(function(err){
  if(err) logger.error(err);
  else{
    //broadcast the message to the ipads
      logger.debug('Updating status connection with JSON');
      ioLoader.emit('chat message', false);
      ioLoader.on('connection', function(socket) { 
      //broadcast the message to the other people
      ioLoader.emit('chat message', false);
    });
  }
});

module.exports = app;