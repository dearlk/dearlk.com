var express = require('express');
var path = require('path');
var fs = require('fs')
var morgan = require('morgan')
var bodyParser = require('body-parser');



// create express app
var app = express();
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse requests of content-type - application/json
app.use(bodyParser.json())
// Configuring the database
var dbConfig = require('./config/database.config.js');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url);
mongoose.connection.once('open', function() {
    console.log("Successfully connected to the database");
})

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'dearlk-web.log'), {flags: 'a'});
// setup the logger
app.use(morgan('full', {stream: accessLogStream}));

// Require Main routes
require('./app/routes/main.routes.js')(app);

// define a simple route
app.get('/', function(req, res){
    //res.json({"message": "Welcome to EasyNotes application. Take notes quickly. Organize and keep track of all your notes."});
   res.render('index', {res});
});


// listen for requests
app.listen(3000, function(){
    console.log("dearlk.com Web Server is listening on port 3000...");
});
