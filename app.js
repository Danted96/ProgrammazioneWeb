var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');

var app = express();

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var routing = require('./routes/routing');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());



/* SOCKET.IO */
// SOCKET IO SRV GLOBAL INIT
var ioMan = require('./zzCustom/socketGlobal');
var server = require('http').Server(app);
ioMan.server(app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
}));

/* socketio */
app.use(session({
    secret: [
        'RU9ND5gMhjlgwrV3hO2Y',
        'SNh3N2rgU7nmi7goR2Rw',
        'VoDFBKuz4yOZhGjvXadz',
        'JSacdKJQKVsK9HctIplN',
        'C8oR1vxQIK4bKB6bovHa'
    ],
    secure: false, //true on https
    resave: false, //true may cause race condition
    saveUninitialized: true,
    cookie: {
        // secure: true // on https
    }
}));





/* routing */
app.use('/', routing);
app.use('/registrazione', routing);
app.use('/prodotto', routing);
app.use('/profilo', routing);
app.use('/carrello', routing);
app.use('/amministrazione', routing);
app.use('/amministrazione/login', routing);
app.use('/amministrazione/prodotti', routing);
app.use('/amministrazione/prodotto', routing);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;