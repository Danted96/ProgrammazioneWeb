var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var mongoose = require('mongoose');

//connessione mongoose
mongoose.connect('mongodb://williamTaruschio:taruschio2@ds159112.mlab.com:59112/pw_e-commerce')
var db = mongoose.connection;
var app = express();

app.use(cookieParser());



//controllo connessione a mongodb
db.once('open', function() {
    console.log('connesso a mongodb');
})
db.on('error', function(err) {
    console.log(err);
})

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());



/* routing */
var routesFrontend = require('./routes/frontend');
routesFrontend(app,db);
var routesBackend = require('./routes/backend');
routesBackend(app,db)





app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});




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