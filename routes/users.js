module.exports = function (app, clickget) {

    var users = clickget.users;
    var fs = clickget.fs;

    function User(nuser) {
        var self = this;
        self.userName = nuser.userName;
        self.id = nuser.id;
        self.password = nuser.password;
        self.roles = nuser.roles;
    }

    users.findById = function (vendorPhone, id) {
        var fileName = 'public/vendor/' + vendorPhone + '/users';
        var vusers = [];
        var vuser = null;
        try {
            if (fs.existsSync(fileName)) vusers = JSON.parse(fs.readFileSync(fileName));
            for (var i = 0; i < vusers.length; i++) {
                if (vusers[i].id == id) {
                    vuser = vusers[i];
                    break;
                }
            }
        } catch (error) {
            console.log(error);
        }
        return vuser;
    };
    users.add = function (vendorPhone, vuser) {
        var fileName = 'public/vendor/' + vendorPhone + '/users';
        var vusers = [];
        if (fs.existsSync(fileName)) vusers = JSON.parse(fs.readFileSync(fileName));
        vusers.push(vuser);
        fs.writeFileSync(fileName, JSON.stringify(vusers));
    };
    users.findByName = function (vendorPhone, userName) {
        var fileName = 'public/vendor/' + vendorPhone + '/users';
        var vusers = [];
        var vuser = null;
        try {
            if (fs.existsSync(fileName)) vusers = JSON.parse(fs.readFileSync(fileName));
            for (var i = 0; i < vusers.length; i++) {
                if (vusers[i].userName == userName) {
                    vuser = vusers[i];
                    break;
                }
            }
        } catch (error) {
            console.log(error);
        }
        return vuser;
    };
    users.remove = function (vendorPhone, id) {
        var fileName = 'public/vendor/' + vendorPhone + '/users';
        var vusers = [];
        var found = false;
        try {
            if (fs.existsSync(fileName)) vusers = JSON.parse(fs.readFileSync(fileName));
            for (var i = 0; i < vusers.length; i++) {
                if (vusers[i].id == id) {
                    vusers.splice(i, 1);
                    found = true;
                    break;
                }
            }
            fs.writeFileSync(fileName, JSON.stringify(vusers));
        } catch (error) {
            console.log(error);
        }
        return found;
    };
    users.update = function (vendorPhone, id, vuser) {
        var fileName = 'public/vendor/' + vendorPhone + '/users';
        var vusers = [];
        var found = false;
        try {
            if (fs.existsSync(fileName)) vusers = JSON.parse(fs.readFileSync(fileName));
            for (var i = 0; i < vusers.length; i++) {
                if (vusers[i].id == id) {
                    found = true;
                    if (typeof vuser.password != "undefined") vusers[i].password = vuser.password;
                    if (typeof vuser.roles != "undefined") vusers[i].roles = vuser.roles;
                    break;
                }
            }
            fs.writeFileSync(fileName, JSON.stringify(vusers));
        } catch (error) {
            console.log(error);
        }
        return found;
    };
    users.login = function (vendorPhone, userName, password) {
        var fileName = 'public/vendor/' + vendorPhone + '/users';
        var vusers = [];
        var userId = null;
        var roles = [];
        try {
            if (fs.existsSync(fileName)) vusers = JSON.parse(fs.readFileSync(fileName));
            else {
                vusers.push({ "userName": "admin", "id": new Date().getTime().toString(), "password": "clickgetme", "roles": ["admin", "vuser"] });
                fs.writeFileSync(fileName, JSON.stringify(vusers));
            }
            for (var i = 0; i < vusers.length; i++) {
                if (vusers[i].userName == userName && vusers[i].password == password) {
                    userId = vusers[i].id;
                    roles = vusers[i].roles;
                    break;
                }
            }
        } catch (error) {
            console.log(error);
        }
        return { "id": userId, "roles": roles };
    };
    users.changePassword = function (vendorPhone, userId, newpassword) {
        //var shaSum = crypto.createHash('sha256');
        //shaSum.update(newpassword);
        //var hashedPassword = shaSum.digest('hex');
        var changed = false;
        if (users.update(vendorPhone, userId, { password: newpassword })) {
            console.log('Change password done for user ' + userId);
            changed: true;
        }
        return changed;
    };
    users.create = function (vendorPhone, userName, phone, password, roles) {
        //var shaSum = crypto.createHash('sha256');
        // shaSum.update(password);

        var user = new User({
            id: new Date().getTime().toString(),
            userName: userName,
            phone: phone,
            roles: roles,
            password: password
        });
        if (users.add(vendorPhone, user)) console.log('user ' + userName + ' was created');
    };

    users.getUserRoles = function (vendorPhone, userId) {
        var fileName = 'public/vendor/' + vendorPhone + '/users';
        var vusers = [];
        var roles = [];
        if (!userId) return null;
        try {
            if (fs.existsSync(fileName)) vusers = JSON.parse(fs.readFileSync(fileName));
            for (var i = 0; i < vusers.length; i++) {
                if (vusers[i].id == userId) {
                    roles = vusers[i].roles;
                    break;
                }
            }
        } catch (error) {
            console.log(error);
        }
        return roles;
    };
    users.setUserRoles = function (vendorPhone, userId, roles) {
        var fileName = 'public/vendor/' + vendorPhone + '/users';
        var vusers = [];
        var found = false;
        try {
            if (fs.existsSync(fileName)) vusers = JSON.parse(fs.readFileSync(fileName));
            for (var i = 0; i < vusers.length; i++) {
                if (vusers[i].id == userId) {
                    vusers[i].roles = roles;
                    found = true;
                    break;
                }
            }
            fs.writeFileSync(fileName, JSON.stringify(vusers));
        } catch (error) {
            console.log(error);
        }
        return found;
    };

    app.post('/addUser', function (req, res) {

        var vendorPhone = req.param('vendorPhone', '');
        var fileName = 'public/vendor/' + vendorPhone + '/users';
        var vusers = [];
        var found = false;
        var user = req.param('user', '');
        if (null == vendorPhone || vendorPhone.length < 1
            || null == user || user.length < 1) {
            res.send(400);
            return;
        }
        if (req.session.isAdmin) {
            try {
                if (fs.existsSync(fileName)) vusers = JSON.parse(fs.readFileSync(fileName));
                for (var i = 0; i < vusers.length; i++) {
                    if (vusers[i].userName == user.userName) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    vusers.push(user);
                    fs.writeFileSync(fileName, JSON.stringify(vusers));
                    res.send(200);
                }

            } catch (error) {
                res.send(500);
            }
        }
        else res.send(401);

    });
    app.post('/removeUser', function (req, res) {

        var vendorPhone = req.param('vendorPhone', '');
        var userId = req.param('userId', '');
        if (null == vendorPhone || vendorPhone.length < 1
            || null == userId || userId.length < 1) {
            res.send(400);
            return;
        }
        if (req.session.isAdmin) {
            if (users.remove(vendorPhone, userId)) res.send(200); else res.send(404);
        }
        else res.send(401);

    });

    app.post('/vlogin', function (req, res) {
        var vendorPhone = req.param('vendorPhone', null);
        var userName = "admin";
        var password = req.param('password', null);

        if (null == userName || userName.length < 1
            || null == vendorPhone || vendorPhone.length < 1
            || null == password || password.length < 1) {
            res.send(400);
            return;
        }
        var login = users.login(vendorPhone, userName, password);
        var userId = login.id;
        var roles = login.roles;
        if (!userId) {
            res.send(401);
            return;
        }
        var isAdmin = false;
        if (roles.indexOf("admin") >= 0) isAdmin = true;
        req.session.loggedIn = true;
        req.session.userId = userId;
        req.session.vendorPhone = vendorPhone;
        req.session.userPhone = userPhone;
        req.session.isAdmin = isAdmin;
        req.session.roles = roles.toString();
        res.send({ "loggedIn": req.session.loggedIn, "vendorPhone": req.session.vendorPhone, "userPhone": req.session.userPhone, "roles": req.session.roles, "userId": userId });
    });
    app.post('/userlogin', function (req, res) {
        var vendorPhone = req.param('vendorPhone', null);
        var userName = req.param('userName', null);
        var password = req.param('password', null);

        if (null == userName || userName.length < 1
            || null == vendorPhone || vendorPhone.length < 1
            || null == password || password.length < 1) {
            res.send(400);
            return;
        }
        var login = users.login(vendorPhone, userName, password);
        var userId = login.id;
        var roles = login.roles;
        var isAdmin = false;
        if (!userId) {
            res.send(401);
            return;
        }
        if (roles.indexOf("admin") >= 0) isAdmin = true;
        req.session.loggedIn = true;
        req.session.userId = userId;
        req.session.vendorPhone = vendorPhone;
        req.session.userPhone = userPhone;
        req.session.roles = roles.toString();
        res.send({ "loggedIn": req.session.loggedIn, "vendorPhone": req.session.vendorPhone, "userPhone": req.session.userPhone, "roles": req.session.roles, "userId": userId });
    });

    app.get('/users/:vendorPhone', function (req, res) {
        var vendorPhone = req.param('vendorPhone', '');
        var fileName = 'public/vendor/' + vendorPhone + '/users';
        var data = "";
        if (req.session && req.session.loggedIn && req.session.vendorPhone == vendorPhone && req.session.isAdmin) {
            if (fs.existsSync(fileName)) data = fs.readFileSync(fileName);
            res.send(data);
        }
        else res.send(401);
    });

    app.get('/users/authenticated/:vendorPhone', function (req, res) {
        var vendorPhone = req.param('vendorPhone', '');
        if (req.session && req.session.loggedIn && req.session.vendorPhone == vendorPhone) {
            res.send(200);
        } else {
            res.send(401);
        }
    });
    app.post('/users/isAdmin', function (req, res) {
        var vendorPhone = req.param('vendorPhone', '');
        if (req.session && req.session.loggedIn && req.session.vendorPhone == vendorPhone && req.session.isAdmin) {
            res.send(200);
        } else {
            res.send(401);
        }
    });

    app.post('/users/saveUser', function (req, res) {
        var vendorPhone = req.param('vendorPhone', '');
        var userName = req.param('userName', null);
        var password = req.param('password', null);
        var userId = req.param('userId', '');
        if (req.session && req.session.loggedIn && req.session.vendorPhone == vendorPhone && req.session.isAdmin) {
            if (users.changePassword(vendorPhone, userId, password)) res.send(200); else res.send(400)
        } else {
            res.send(401);
        }
    });
    app.get('/logintest/:phone', function (req, res) {
        res.render('LoginTest', { title: 'OrderTaker ', phone: req.params.phone });
    });
    // vendor user login
    app.post('/demologin', function (req, res) {
        var vendorPhone = "2542543863";
        var userName = "admin";
        var userPhone = "4048403559";
        var password = "clickgetme";
        var login = users.login(vendorPhone, userName, password);
        var userId = login.id;
        var roles = login.roles;
        if (!userId) {
            res.send(401);
            return;
        }
        var isAdmin = false;
        if (roles.indexOf("admin") >= 0) isAdmin = true;
        req.session.loggedIn = true;
        req.session.userId = userId;
        req.session.vendorPhone = vendorPhone;
        req.session.userPhone = userPhone;
        req.session.isAdmin = isAdmin;
        req.session.roles = roles.toString();
        res.send(200);
    });
    app.post('/ulogin', function (req, res) {
        var vendorPhone = req.param('vendorPhone', null);
        var userName = 'admin';
        // var userPhone = req.param('userPhone', null);
        var password = req.param('password', null);
        var ret = false;
        if (null == userName || userName.length < 1
                || null == vendorPhone || vendorPhone.length < 1
                || null == password || password.length < 1) {
            res.send(false);
            return;
        }
        var login = users.login(vendorPhone, userName, password);
        var userId = login.id;
        var roles = login.roles;
        var isAdmin = false;
        if (userId) {
            ret = true;
        }
        if (ret) {
            if (roles.indexOf("admin") >= 0) isAdmin = true;
            req.session.loggedIn = true;
            req.session.userId = userId;
            req.session.vendorPhone = vendorPhone;
            // req.session.userPhone = userPhone;
            req.session.roles = roles.toString();
            req.session.isAdmin = isAdmin;
        }
        res.send(ret);

    });
}

