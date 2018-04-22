var express = require('express');
var router = express.Router();
var User = require('../models/user');


// GET route for reading data
router.get('/', function (req, res, next) {
  if (req.session.userId) {
    res.redirect('/profile');
  }
  else {
    res.render('login')
  }
});
// GET route for reading data
router.get('/dashboard', function (req, res, next) {
  if (req.session.userId) {
    res.render('dashboard',{username: req.session.userId, email: req.session.email});
  }
  else {
    res.render('/')
  }
});


//POST route for login
router.post('/login', function (req, res, next) {
  if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        //return next(err);
        res.render('login', {error: err})
      } else {
        req.session.userId = user._id;
        req.session.email = user.email;
        return res.redirect('/dashboard');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    //return next(err);
    res.render('login', {error: err})
  }
})

//POST route for updating data
router.post('/signup', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  } 
})

// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          //var err = new Error('Not authorized! Go back!');
          //err.status = 400;
          //return next(err);
          res.redirect('/')
        } else {
          //return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
          res.redirect('/dashboard')
        }
      }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;