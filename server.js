
/**
* MODULE DEPENDENCIES
* -------------------------------------------------------------------------------------------------
* include any modules you will use through out the file
**/

var express = require('express')
  , http = require('http')
  , nconf = require('nconf')
  , path = require('path')
  , everyauth = require('everyauth')
  , Recaptcha = require('recaptcha').Recaptcha;
var nodemailer = require('nodemailer');
var fs = require('fs');
//var smtpTransport = nodemailer.createTransport("SMTP", {
//    auth: {
//        user: "gmail.clickgetme@gmail.com", // service is detected from the username
//        pass: "N0no!@#$"
//    }
//});
/**
* CONFIGURATION
* -------------------------------------------------------------------------------------------------
* load configuration settings from ENV, then settings.json.  Contains keys for OAuth logins. See 
* settings.example.json.  
**/
nconf.env().file({ file: 'settings.json' });



/**
* EVERYAUTH AUTHENTICATION
* -------------------------------------------------------------------------------------------------
* allows users to log in and register using OAuth services
**/

everyauth.debug = true;

// Configure local password auth
var usersById = {},
    nextUserId = 0,
    usersByFacebookId = {},
    usersByTwitId = {},
    usersByLogin = {
        'user@example.com': addUser({ email: 'user@example.com', password: 'azure' })
    };

everyauth.
    everymodule.
    findUserById(function (id, callback) {
        callback(null, usersById[id]);
    });


/**
* FACEBOOK AUTHENTICATION
* -------------------------------------------------------------------------------------------------
* uncomment this section if you want to enable facebook authentication.  To use this, you will need
* to get a facebook application Id and Secret, and add those to settings.json.  See:
* http://developers.facebook.com/
**/

//everyauth.
//    facebook.
//    appId(nconf.get('facebook:applicationId')).
//    appSecret(nconf.get('facebook:applicationSecret')).
//    findOrCreateUser(
//	function (session, accessToken, accessTokenExtra, fbUserMetadata) {
//	    return usersByFacebookId[fbUserMetadata.claimedIdentifier] ||
//		(usersByFacebookId[fbUserMetadata.claimedIdentifier] =
//		 addUser('facebook', fbUserMetadata));
//	}).
//    redirectPath('/');


/**
* TWITTER AUTHENTICATION
* -------------------------------------------------------------------------------------------------
* uncomment this section if you want to enable twitter authentication.  To use this, you will need
* to get a twitter key and secret, and add those to settings.json.  See:
* https://dev.twitter.com/
**/

//everyauth
//  .twitter
//    .consumerKey(nconf.get('twitter:consumerKey'))
//    .consumerSecret(nconf.get('twitter:consumerSecret'))
//    .findOrCreateUser(function (sess, accessToken, accessSecret, twitUser) {
//        return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
//    })
//    .redirectPath('/');



/**
* USERNAME & PASSWORD AUTHENTICATION
* -------------------------------------------------------------------------------------------------
* this section provides basic in-memory username and password authentication
**/

everyauth
  .password
    .loginWith('email')
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('account/login')
    .loginLocals(function (req, res, done) {
        setTimeout(function () {
            done(null, {
                title: 'login.  '
            });
        }, 200);
    })
    .authenticate(function (login, password) {
        var errors = [];
        if (!login) errors.push('Missing login');
        if (!password) errors.push('Missing password');
        if (errors.length) return errors;
        var user = usersByLogin[login];
        if (!user) return ['Login failed'];
        if (user.password !== password) return ['Login failed'];
        return user;
    })
    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('account/register')
    .registerLocals(function (req, res, done) {
        setTimeout(function () {
            done(null, {
                title: 'Register.  ',
                recaptcha_form: (new Recaptcha(nconf.get('recaptcha:publicKey'), nconf.get('recaptcha:privateKey'))).toHTML()
            });
        }, 200);
    })
    .extractExtraRegistrationParams(function (req) {
        return {
            confirmPassword: req.body.confirmPassword,
            data: {
                remoteip: req.connection.remoteAddress,
                challenge: req.body.recaptcha_challenge_field,
                response: req.body.recaptcha_response_field
            }
        };
    })
    .validateRegistration(function (newUserAttrs, errors) {
        var login = newUserAttrs.login;
        var confirmPassword = newUserAttrs.confirmPassword;
        if (!confirmPassword) errors.push('Missing password confirmation');
        if (newUserAttrs.password != confirmPassword) errors.push('Passwords must match');
        if (usersByLogin[login]) errors.push('Login already taken');

        // validate the recaptcha 
        var recaptcha = new Recaptcha(nconf.get('recaptcha:publicKey'), nconf.get('recaptcha:privateKey'), newUserAttrs.data);
        recaptcha.verify(function (success, error_code) {
            if (!success) {
                errors.push('Invalid recaptcha - please try again');
            }
        });
        return errors;
    })
    .registerUser(function (newUserAttrs) {
        var login = newUserAttrs[this.loginKey()];
        return usersByLogin[login] = addUser(newUserAttrs);
    })
    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/');

// add a user to the in memory store of users.  If you were looking to use a persistent store, this
// would be the place to start
function addUser(source, sourceUser) {
    var user;
    if (arguments.length === 1) {
        user = sourceUser = source;
        user.id = ++nextUserId;
        return usersById[nextUserId] = user;
    } else { // non-password-based
        user = usersById[++nextUserId] = { id: nextUserId };
        user[source] = sourceUser;
    }
    return user;
}



var app = express();
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('azure zomg'));
    app.use(express.session());
    app.use(everyauth.middleware(app));
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});


/**
* ROUTING
* -------------------------------------------------------------------------------------------------
* include a route file for each major area of functionality in the site
**/
var orders = {};
var closedOrders = {};
var users = function() {
    this.vusers = [];
    this.fileName = "";
    
};
var vendorsDb = {};
var vendors = {};
var fs = require('fs');
var mkdirp = require('mkdirp');
var vendorObj = function() {
    this.phone = "";
    this.name = "";
    this.email = "";
    this.sessions = [];
    this.sessionsOnline = {};
    this.isOnline = null;
    this.users = new users;
    this.customers = [];
    this.custOnline = {};
    
};

function initVendors() {
    fs.readdirSync('public/vendor').forEach(function (file) {
        console.log(file.toString());
        if (file[0] == '.') return;

        var phone = file.toString();

        try {
            var vendorfile = fs.readFileSync('public/vendor/' + phone + '/vendor.js').toString();
            eval(vendorfile);
            if (typeof vendor.name != 'undefined') {
                vendors[phone] = new vendorObj;
                vendors[phone].phone = phone;
                vendors[phone].name = vendor.name;
                vendors[phone].email = vendor.email;
                vendors[phone].schedule = fs.readFileSync('public/vendor/' + phone + '/schedule.json');
            }

        }
        catch (err) {
            console.log(err.message);
            // remove folder not a vendor file
            try {
                fs.rmdirSync('public/vendor/' + phone);
            }
            catch (err) {
                console.log(err.message);
            }

        }


        // var i = vendorfile.indexOf("=");
        // var vendor = JSON.parse(vendorfile.substring(i + 1));


    });
    
}

initVendors();
//var nodemailer = require('nodemailer');
var clickget = { orders: orders, closedOrders: closedOrders, fs: fs, mkdirp: mkdirp, nodemailer: nodemailer, users: users, vendorsDb: vendorsDb, vendors: vendors, vendorObj: vendorObj };

require('./routes/home')(app, clickget);
require('./routes/users')(app, clickget);
require('./routes/vendor')(app, clickget);
require('./routes/account')(app, clickget);
require('./routes/orders')(app, clickget);


var server = http.createServer(app);



/**
* CHAT / SOCKET.IO 
* -------------------------------------------------------------------------------------------------
* this shows a basic example of using socket.io to orchestrate chat
**/

// socket.io configuration
var buffer = [];
var io = require('socket.io').listen(server);
//order takeker socket code

io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
  //  io.set('close timeout', 60*60*24); // 24h time out
});


function removeItem(array, item){
    for(var i in array){
        if(array[i]==item){
            array.splice(i,1);
            break;
            }
    }
}
var ordertaker = require('ordertaker');
var order_room = io;
ordertaker.set_sockets(order_room.sockets, vendors);
order_room.sockets.on('connection', function (socket) {
    ordertaker.connect_ordertaker({
        socket: socket,
        username: socket.id
    });
});

io.sockets.on('connection', function (socket) {
    //socket.emit('messages', { buffer: buffer });
    //socket.on('setname', function (name) {
    //    socket.set('name', name, function () {
    //        socket.broadcast.emit('announcement', { announcement: name + ' connected' });
    //    });
    //});
    //socket.on('message', function (message) {
    //    socket.get('name', function(err, name) {
    //        var msg = { message: [name, message] };
    //        buffer.push(msg);
    //        if (buffer.length > 15) buffer.shift();
    //        socket.broadcast.emit('message', msg);
    //    });
    //});
    socket.on('setvendor', function (vendor) {
        socket.vendorPhone = vendor.phone;
        // check if vendor exsist
        if (typeof vendors[vendor.phone] == 'undefined') {
            vendors[vendor.phone] = new vendorObj;
            vendors[vendor.phone].phone = vendor.phone;
        };
        //check if session alread exsist
        ;
        if (typeof vendors[vendor.phone].sessions == 'undefined') vendors[vendor.phone].sessions = new Array();
        if (vendors[vendor.phone].sessions.indexOf(vendor.sessionId) == -1) {
            vendors[vendor.phone].sessions.push(vendor.sessionId);
        }
    });
    socket.on('clearvendor', function (vendor) {
        // check if vendor exsist
        if (typeof vendors[vendor.phone] == 'undefined') {
            vendors[vendor.phone] = new vendorObj;
            vendors[vendor.phone].phone = vendor.phone;
        };
        //check if session alread exsist
        ;
        if (typeof vendors[vendor.phone].sessions == 'undefined') vendors[vendor.phone].sessions = new Array();
        if (vendors[vendor.phone].sessions.indexOf(vendor.sessionId) == -1) {
            removeItem(vendors[vendor.phone].sessions, vendor.sessionId);
        }
    });
    socket.on('setvendorcustomer', function (vendorCustomer) {
        var phone = vendorCustomer.phone;
        socket.vendor = phone;
        // check if vendor exsist
        if (typeof vendors[phone] == 'undefined') {
            vendors[phone] = new vendorObj;
            vendors[phone].phone = phone;
        };
        if (vendors[phone].customers.indexOf(vendorCustomer.sessionId) == -1) {
            vendors[phone].customers.push(vendorCustomer.sessionId);
            vendors[phone].custOnline[vendorCustomer.sessionId] = new Date().getTime();
        }
    });
    socket.on('clearvendorcustomer', function(vendorCustomer) {
        // check if vendor exsist
        var phone = vendorCustomer.phone;
        if (typeof vendors[phone] == 'undefined') {
            vendors[phone] = new vendorObj;
            vendors[phone].phone = phone;
        };
        if (vendorCustomer.sessionId) {
        
        removeItem(vendors[phone].customers, vendorCustomer.sessionId);
        delete vendors[phone].custOnline[vendorCustomer.sessionId];
    }
     //socket.emit('messages', { buffer: buffer });
       // socket.emit('custconnect', { "phone": vendor });
    });

    socket.on('disconnect', function () {
        var vendorPhone = socket.vendorPhone;
        if (vendorPhone) {
            vendors[vendorPhone].sessions.remove(socket.id);
            // if no vendor clients connected the then offline
            if (vendors[vendorPhone].sessions.lengh == 0) {
                vendors[vendorPhone].isOnline = false;
                //var rdata = { "phone": vendor.phone, "isOnline": vendor.isOnline(), "sessionId": vendor.sessionId };
                socket.broadcast.emit('isonline', { "phone": vendorPhone, "sessionId": socket.id, "isOnline": false });
            }
        }
        var vendor = socket.vendor;
        if (vendor) {
            if (typeof vendors[vendor] == 'undefined' || typeof vendors[vendor].customers == 'undefined') return;
            removeItem(vendors[vendor].customers, socket.id);
            socket.broadcast.emit('custconnect', {"phone": vendor });
        }

    });

});


/**
* RUN
* -------------------------------------------------------------------------------------------------
* this starts up the server on the given port
**/

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});