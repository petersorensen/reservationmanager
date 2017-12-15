var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var authenticate = require('./authenticate');
var cors = require('cors');

var config = require('./config');

mongoose.connect(config.mongoUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to server");
});

    // Use bluebird
    mongoose.Promise = require('bluebird');
//    assert.equal(query.exec().constructor, require('bluebird'));

var routes = require('./routes/index');
var users = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var favoriteRouter = require('./routes/favoriteRouter');
var locationRouter = require('./routes/locationRouter');
var personRouter = require('./routes/personRouter');
var groupRouter = require('./routes/groupRouter');
var reservationRouter = require('./routes/reservationRouter');
var tripRouter = require('./routes/tripRouter');
var vehicleRouter = require('./routes/vehicleRouter');

var app = express();
app.use(cors({origin: '*'}));

// Secure traffic only
/*
app.all('*', function(req, res, next){
    console.log(req.method,': req start: ',req.secure, req.hostname, req.url, app.get('port'));
    if (!req.secure) {
        console.log("SENDER VIDERE")
        return next();
    };
    console.log("PHSREDIRECT")
// 307 Temporary Redirect (since HTTP/1.1) In this occasion, the request should be repeated with another URI, but future requests can still use the original URI. In contrast to 303, the request method should not be changed when reissuing the original request. For instance, a POST request must be repeated using another POST request.
    res.redirect(307,'https://'+req.hostname+':'+app.get('secPort')+req.url);
});
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// passport config
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leadership', leaderRouter);
app.use('/favorites', favoriteRouter);
app.use('/locations', locationRouter);
app.use('/people', personRouter);
app.use('/groups', groupRouter);
app.use('/reservations', reservationRouter);
app.use('/trips', tripRouter);
app.use('/vehicles', vehicleRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found PHS');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

module.exports = app;