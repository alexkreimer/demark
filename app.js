/**
 * Module dependencies.
 */

var express = require('express');
var i18n = require('i18next');

i18n.init({saveMissing:true, debug:true});

var appstore = require('./appstore-mongodb').appstore;
var app = express();

// Configuration

app.configure(function(){
    app.use(i18n.handle);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger());
    app.use(express.bodyParser());
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
    res.render('index.jade');
});

app.get('/thanks', function(req, res){
    res.render('thanks.jade');
});

app.post('/', function(req, res){
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

app.listen(8080);
