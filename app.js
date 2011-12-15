
/**
 * Module dependencies.
 */

var express = require('express'),
    http    = require("http"),
    https   = require("https"),
    xml2js  = require("xml2js");

require('./big-brother.js');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

BigBrother.parser = new xml2js.Parser({normalize: false, trim:false});
BigBrother.tokens.pivotalTracker = process.env.bb_pivotal_token;
BigBrother.countdown.until = process.env.bb_countdown_end;
BigBrother.clients.http = http;
BigBrother.clients.https = https;

io.sockets.on('connection', function(socket){
  BigBrother.socket = socket;
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express['static'](__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.render('index.ejs', {layout: false});
});

var bugs = BigBrother.bugs;
bugs.update();

app.get('/data/bugs.json', function(req, res){
  res.send(bugs.store);
});

var project = BigBrother.project;
project.update();

app.get('/data/project.json', function(req, res){
  res.send(project.store);
});

var commits = BigBrother.commits;
commits.update();

app.get('/data/commits.json', function(req, res){
  res.send(commits.store);
});

var tube = BigBrother.tube;
tube['import']();

app.get('/data/tube.json', function(req, res){
  res.send(tube.store);
});

var countdown = BigBrother.countdown;
app.get('/data/countdown.json', function(req, res){
  res.send(countdown);
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
