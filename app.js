/**
 * Module dependencies.
 */

var express = require('express'),
    i18n = require('i18next'),
    util = require('util'),
    expressValidator = require('express-validator');


i18n.init({saveMissing:true, debug:true});

var appstore = require('./appstore-mongodb').appstore;
var app = express();

// Configuration

app.configure(function(){
    app.use(express.static(__dirname + '/public/bootstrap-3.0.0-dist'));
    app.use(i18n.handle);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(expressValidator());
    app.use(express.methodOverride());
    app.use(require('stylus').middleware({ src: __dirname + '/public' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

i18n.registerAppHelper(app);

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

var store = new appstore('localhost', 27017);

app.get('/', function(req, res){
    res.render('index.jade',{active:'home'});
});

app.get('/faq', function(req, res) {
    res.render('faq.jade',{active:'faq'});
});

app.get('/thanks', function(req, res){
    res.render('thanks.jade',{active:'home'});
});

app.post('/', function(req, res){
    req.assert('firstname','is a must').notEmpty();
    req.assert('lastname','is a must').notEmpty();
    req.assert('email','needs to be a valid email').isEmail();

    // true returns mapped errors, instead of a list
    var errors = req.validationErrors(true);
    console.log(errors);
    if (errors) {
	res.render('index.jade',{active:'home',errors:errors});
	return;
    }

    store.save({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
	email: req.body.email,
	aboutu: req.body.aboutu
    }, function(error, docs) {
        res.redirect('/thanks')
    });
});

//get applications
app.get('/list', function(req, res) {
    store.all(function(error, docs) {
        res.render('apps-list.jade', {apps: docs});
    });
});

var port = process.env.PORT || 8080;

app.listen(port, function() {
  console.log("Listening on " + port);
});
