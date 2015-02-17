var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
var http = require('http');



//app.get('/', function(req, res, next) { res.send('Hello world!'); });

//var server = app.listen(9000);

/*var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);

app.configure(function() {
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

var passport = require('passport'), LocalStrategy = require('passport-local').Strategy; 

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user || !user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect credentials.' });
      }
      //if (!user.validPassword(password)) {
      //  return done(null, false, { message: 'Incorrect password.' });
      //}
      return done(null, user);
    });
  }
));

// requires the model with Passport-Local Mongoose plugged in
var User = require('./models/user');

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());*/








/*

var path = require('path');

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


// main config
//app.set('port', process.env.PORT || 1337);
//app.set('port', process.env.PORT || 9003);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', { layout: false });
logger = require('morgan');
app.use(logger('dev'));
body_parser = require('body-parser');
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: false}));
method_override = require('method-override');
app.use(method_override());
cookie_parser = require('cookie-parser');
app.use(cookie_parser());
cookie_session = require('cookie-session');
errorhandler = require('errorhandler');
app.use(cookie_session({ keys: ['secretkey1', 'secretkey2']}));
app.use(passport.initialize());
app.use(passport.session());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if (app.get('env') === 'development') {
    app.use(errorhandler({ dumpExceptions: true, showStack: true }));
}
//app.configure('development', function(){
//    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
//});

if (app.get('env' === 'production')) {
    app.use(errorhandler());
}

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy({
  //usernameField: 'id'
}, Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect('mongodb://localhost/passport_local_mongoose', function(err) {
  if (err) {
    console.log('Could not connect to mongodb on localhost. Ensure that you have mongodb running on localhost and mongodb accepts connections on standard ports!: '+err);
  }
});

// routes
require('./routes')(app);

app.listen(app.get('port'), function(){
  console.log(("Express server listening on port " + app.get('port')));
});

*/




var options = {
    debug: true
};

var server = http.createServer(app);

app.use('/peerjs', ExpressPeerServer(server, options));

server.listen(9002);