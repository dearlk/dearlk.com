var express = require('express');
var router = express.Router();
var User = require('../models/user');
var ansible = require('../controllers/ansible')
var Ansible = require('node-ansible');
var path = require('path');

// GET route for reading data
router.get('/', function (req, res, next) {
  if (req.session.userId) {
    //res.redirect('/dashboard');
    res.render('index');
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
    return res.redirect('/')
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
        //return res.redirect('/dashboard');
        return res.redirect('/');
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


// GET for ping
router.get('/pingServer', function (req, res, next) {
   var host = req.query.host;

   console.log("host="+host)
   var ping_command = new Ansible.AdHoc().hosts(host+".delapic").module('ping');
   var promise = ping_command.exec();
   promise.then(function(result) {
      console.log(result.output);
      console.log(result.code);
       try {
        var data = result.output;
        data = data.replace(/^.*/,'{');
        var jdata = JSON.parse(data);
        var info = {
                     "changed": jdata.changed,
                     "ping": jdata.ping,
                     "code": 0
                   };
        console.log(info);

      } catch (err) {
        console.log("catched here................");
        console.error(err);
      }
      res.send(info);

  },function(err) {
       //console.error(err);
       var data = err.message.replace(/^.*/,'{');
       var jdata = JSON.parse(data);
       var info = {
                     "error": "UNREACHABLE",
                     "msg": jdata.msg,
                     "code": -1
                   };
       console.log("in error:" + err);
       console.log(info);
       res.send(info);
    }) 

});


// GET for checkServer
router.get('/checkServer', function (req, res, next) {
   var host = req.query.host;
   host = host + ".delapic";
   console.log("checkServer:host=" + host)
   var command = new Ansible.AdHoc().hosts(host).module('setup');
   var promise = command.exec();
   promise.then(function(result) {
      console.log(result.code);
      try {
        var data = result.output;
        data = data.replace(/^.*/,'{');
        var jdata = JSON.parse(data);
        var info = {
                     "mem": jdata.ansible_facts.ansible_memory_mb.real,
                     "disk": jdata.ansible_facts.ansible_mounts[0],
                     "ping": 0
                   };
        console.log(info);

      } catch (err) {
        console.log("catched here................");
        console.error(err);
      }
      res.send(info);

  },function(err) {
       //console.error(err);
       var data = err.message.replace(/^.*/,'{');
       var jdata = JSON.parse(data);
       var info = {
                     "error": "UNREACHABLE",
                     "msg": jdata.msg,
                     "ping": -1
                   };
       console.log("in error:" + err);
       console.log(info);
       res.send(info);
    })   
});


// GET for actionServer
router.get('/actionServer', function (req, res, next) {
   var host = req.query.host;
   host = host + ".delapic";
   var action = req.query.action;
   console.log("actionServer:host=" + host + ", action="+action);
   
   var command=null;
   var promise=null;
   var playbook = null;
   var shutdown_playbook = path.join(__dirname, "../playbooks/shutdown");
   var reboot_playbook = path.join(__dirname, "../playbooks/reboot");
   var update_playbook = path.join(__dirname, "../playbooks/update");
   
   //return;
     //if (action == "shutdown"){
       // command = new Ansible.AdHoc().hosts(host).module('shell').args('-s /sbin/shutdown +1'); 
     //}else 
     if (action=="reboot"){
        //command = new Ansible.AdHoc().hosts(host).module('shell').args('-s /sbin/shutdown -r +1'); 
        console.log("playbook:"+reboot_playbook);
        command = new Ansible.Playbook().playbook(reboot_playbook).variables({ host: host });
     }else if (action=="update"){
        //command = new Ansible.AdHoc().hosts(host).module('shell').args('sudo apt-get update && sudo apt-get upgrade -y'); 
        console.log("playbook:"+update_playbook);
        command = new Ansible.Playbook().playbook(update_playbook).variables({ host: host });
     }else if (action == "shutdown"){
        console.log("playbook:"+shutdown_playbook);
        command = new Ansible.Playbook().playbook(shutdown_playbook).variables({ host: host });
     }
   console.log('executing now...');
   command.verbose('v');
   //command.asSudo();
   //command.su('root');
   promise = command.exec();

   promise.then(function(result) {
      
      console.log("==================================================================================================");
      console.log(result.output);
      console.log(result.code);
      console.log("==================================================================================================");

      try {
        //var data = result.output;
        //data = data.replace(/^.*/,'{');
        //var jdata = JSON.parse(data);
        var info = {
 
                     "output": result.output,
                     "code": result.code
                    };
 
        console.log(info);

      } catch (err) {
        console.log("catched here................");
        console.error(err);
      }
      res.send(info);

  },function(err) {
       //console.error(err);
       //var data = err.message.replace(/^.*/,'{');
       //var jdata = JSON.parse(data);
       var info = {
                     
                     "msg": err.message,
                     "code": -1
                   };

       console.log("in error:" + err);
       console.log(info);
       res.send(info);
    })   
});

module.exports = router;
