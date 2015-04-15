module.exports = function (mongoose) {
    var crypto = require('crypto');
    var Status = new mongoose.Schema({
        phone: { type: String },
        status: { type: String }
    });

    var schemaOptions = {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    };

    var OrderSchema = new mongoose.Schema({
        from: { type: String },
        to: { type: String },
        orderItems: [{}]
    }, schemaOptions);

    var GeoCoordinateSchema = new mongoose.Schema({
        elevation: { type: String },
        latitude: { type: String },
        longitude: { type: String }
    }, schemaOptions);


    var Orderer = new mongoose.Schema({
        phone: { type: String },
        userId: { type: mongoose.Schema.ObjectId }
    }, schemaOptions);

    Orderer.virtual('online').get(function () {
        return app.isUserOnline(this.get('userId'));
    });

    var UserSchema = new mongoose.Schema({
        email: { type: String, unique: true },
        phone: { type: String, unique: true },
        password: { type: String },
        name: {
            first: { type: String },
            last: { type: String },
            full: { type: String }
        },
        orders: [OrderSchema],
        locations: [GeoCoordinateSchema]
    });

    var User = mongoose.model('User', UserSchema);


    var registerCallback = function (err) {
        if (err) {
            return console.log(err);
        };
        return console.log('User was created');
    };

    var changePassword = function (userId, newpassword) {
        var shaSum = crypto.createHash('sha256');
        shaSum.update(newpassword);
        var hashedPassword = shaSum.digest('hex');
        User.update({ _id: UserId }, { $set: { password: hashedPassword } }, { upsert: false },
          function changePasswordCallback(err) {
              console.log('Change password done for user ' + userId);
          });
    };
    config.mail = {
        service: "goddady",
        host: "smtpout.secureserver.net",
        port: 587,
        secureConnection: false,
        //name: "servername",
        auth: {
            user: "info@clickget.me",
            pass: "Nono!@#$5"
        },
        ignoreTLS: false,
        debug: false,
        maxConnections: 5 // Default is 5
    }

    var forgotPassword = function (email, resetPasswordUrl, callback) {
        var user = User.findOne({ email: email }, function findUser(err, doc) {
            if (err) {
                // Email address is not a valid user
                callback(false);
            } else {
                var smtpTransport = nodemailer.createTransport('SMTP', config.mail);
                resetPasswordUrl += '?user=' + doc._id;
                smtpTransport.sendMail({
                    from: 'info@clickget.me',
                    to: doc.email,
                    subject: 'ClickGetMe Password Request',
                    text: 'Click here to reset your password: ' + resetPasswordUrl
                }, function forgotPasswordResult(err) {
                    if (err) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                });
            }
        });
    };

    var login = function (email, password, callback) {
        var shaSum = crypto.createHash('sha256');
        shaSum.update(password);
        User.findOne({ email: email, password: shaSum.digest('hex') }, function (err, doc) {
            callback(doc);
        });
    };

    var findByString = function (searchStr, callback) {
        var searchRegex = new RegExp(searchStr, 'i');
        User.find({
            $or: [
            { 'name.full': { $regex: searchRegex } },
            { phone: { $regex: searchRegex } },
            { email: { $regex: searchRegex } }
            ]
        }, callback);
    };

    var findById = function (userId, callback) {
        User.findOne({ _id: userId }, function (err, doc) {
            callback(doc);
        });
    };

    var addOrderer = function (user, addOrderer) {
        Orderer = {
            name: addOrderer.name,
            userId: addOrderer._id
        };
        user.orderer.push(orderer);

        user.save(function (err) {
            if (err) {
                console.log('Error saving user: ' + err);
            }
        });
    };

    var removeOrderer = function (user, ordererId) {
        if (null == user.orderer) return;

        user.orderer.forEach(function (orderer) {
            if (orderer.userId == ordererId) {
                user.orderer.remove(orderer);
            }
        });
        user.save();
    };

    var hasOrderer = function (user, ordererId) {
        if (null == user.orderer) return false;

        user.Orderer.forEach(function (orderer) {
            if (orderer.userId == ordererId) {
                return true;
            }
        });
        return false;
    };

    var register = function (email, password, firstName, lastName, phone) {
        var shaSum = crypto.createHash('sha256');
        shaSum.update(password);

        console.log('Registering ' + email);
        var user = new User({
            email: email,
            name: {
                first: firstName,
                last: lastName,
                full: firstName + ' ' + lastName
            },
            phone: phone,
            password: shaSum.digest('hex')
        });
        user.save(registerCallback);
        console.log('Save command was sent');
    };

    return {
        findById: findById,
        register: register,
        hasOrderer: hasOrderer,
        forgotPassword: forgotPassword,
        changePassword: changePassword,
        login: login,
        User: User
    }
}
