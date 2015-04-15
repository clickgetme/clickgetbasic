module.exports = function(app, models) {
  app.post('/login', function(req, res) {
      var email = req.param('email', null);
      var password = req.param('password', null);
  
    if ( null == email || email.length < 1
        || null == password || password.length < 1) {
      res.send(400);
      return;
    }
  
    models.User.login(email, password, function(user) {
      if ( !user ) {
        res.send(401);
        return;
      }
      req.session.loggedIn = true;
      req.session.userId = user._id;
      res.send(200);
    });
  });
  
  app.post('/register', function(req, res) {
    var firstName = req.param('firstName', '');
    var lastName = req.param('lastName', '');
    var email = req.param('email', null);
    var phone = req.param('phone', null);
    var password = req.param('password', null);
  
    if ( null == email || email.length < 1
         || null == password || password.length < 1
         || null == phone || phone.length < 1) {
      res.send(400);
      return;
    }
  
    models.User.register(email, password, phone, firstName, lastName);
    res.send(200);
  });
  
  app.get('/users/authenticated', function (req, res) {
      console.log('enter: /users/authenticated ')
    if ( req.session && req.session.loggedIn ) {
      res.send(200);
    } else {
      res.send(401);
    }
  });
  
  app.post('/forgotpassword', function(req, res) {
    var hostname = req.headers.host;
    var resetPasswordUrl = 'http://' + hostname + '/resetPassword';
    var email = req.param('email', null);
    if ( null == email || email.length < 1 ) {
      res.send(400);
      return;
    }
  
    models.User.forgotPassword(email, resetPasswordUrl, function(success){
      if (success) {
        res.send(200);
      } else {
        // Username or password not found
        res.send(404);
      }
    });
  });

  app.get('/resetPassword', function(req, res) {
    var usersId = req.param('users', null);
    res.render('resetPassword.jade', {locals:{usersId:usersId}});
  });
  
  app.post('/resetPassword', function(req, res) {
    var usersId = req.param('usersId', null);
    var password = req.param('password', null);
    if ( null != usersId && null != password ) {
      models.User.changePassword(usersId, password);
    }
    res.render('resetPasswordSuccess.jade');
  });
}