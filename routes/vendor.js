module.exports = function (app, clickget) {
    function stringBuilder(value) {
        this.strings = new Array("");
        this.append(value);
    }
    Array.prototype.remove = function (value) {
        for (var i = 0; i < this.length;) {
            if (this[i] === value) {
                this.splice(i, 1);
            } else {
                ++i;
            }
        }
    };

    stringBuilder.prototype.append = function (value) {
        if (value) {
            this.strings.push(value);
        };
    };

    stringBuilder.prototype.clear = function () {
        this.strings.length = 1;
    };

    stringBuilder.prototype.toString = function () {
        return this.strings.join("");
    };
    function rtfFormate(c) {
        var l = new stringBuilder();
        l.append("OrderTaker\t"); l.append("# " + c.number);
        l.append("\n" + c.ordername + "\t");
        l.append(c.date);
        var oLines = c.orderLines;
        for (var o = 0; o < oLines.length; o++) {
            var oLine = oLines[o];
            var item = (oLine.item).split("|");
            var itemName =  item[0].trim();
            l.append("\r\n" + oLine.quantity.trim() + " " + itemName + "\r\n");
            if (typeof item[1] == "undefined") item[1] = "";
            if (item[1]) {
                var details = item[1].replace("[", "").replace("]", "").trim();
                var selects = details.split(",");
                for (var s = 0; s < selects.length; s++) {
                    l.append(selects[s].trim() + "\r\n");
                    
                }
            };
            if (typeof item[2] == "undefined") item[2] = "";
            if (item[2]) {
                var itemIncludes = item[2].replace("[", "").replace("]", "");
                var includes = itemIncludes.split(",");
                for (var i = 0; i < includes.length; i++) {
                    l.append(includes[i].trim());
                    l.append("\r\n");
                        
                }
            };
            if (typeof item[3] == "undefined") item[3] = "";
            if ((item[3])) l.append(item[3].trim() + "\r\n");
        }
       
        l.append("Pick up Time: " + c.pickuptime + "\r\n\Total: " + c.total + "\r\n\r\n\f");
        return l.toString();
    }
    var fs = clickget.fs;
    var nodemailer = clickget.nodemailer;
    var mkdirp = clickget.mkdirp;
    var vendorsDb = clickget.vendorsDb;
    var vendors = clickget.vendors;
    var vendorObj = clickget.vendorObj;
    function Vendor(nvendor) {
        var self = this;
        self.vendorName = nvendor.vendorName;
        self.vendorUrl = nvendor.vendorUrl;
        self.vendorPhone = nvendor.vendorPhone;
        self.vendorEmail = nvendor.vendorEmail;
        self.vendorFax = nvendor.vendorFax;
        self.id = nvendor.id;
        self.password = nvendor.password;
        self.firstName = nvendor.firstName;
        self.LastName = nvendor.LastName;
        self.contactEmail = nvendor.contactEmail;
        self.contactPhone = nvendor.contactPhone;
        self.country = nvendor.country;
        self.city = nvendor.city;
        self.zip = nvendor.zip;
        self.state = nvendor.state;
        self.address1 = nvendor.address1;
        self.address2 = nvendor.address2;
        self.active = true;
        self.startdate = "";

    }

    vendorsDb.findById = function (id) {
        var fileName = 'public/vendors';
        var cgVendors = [];
        var cgVendor = null;
        try {
            if (fs.existsSync(fileName)) cgVendors = JSON.parse(fs.readFileSync(fileName));
            for (var i = 0; i < cgVendors.length; i++) {
                if (cgVendors[i].id == id) {
                    cgVendor = cgVendors[i];
                    break;
                }
            }
        } catch (error) {
            console.log(error);
        }
        return cgVendor;
    };
    vendorsDb.findByPhone = function (vendorPhone) {
        var fileName = 'public/vendors';
        var cgVendors = [];
        var cgVendor = null;
        try {
            if (fs.existsSync(fileName)) cgVendors = JSON.parse(fs.readFileSync(fileName));
            for (var i = 0; i < cgVendors.length; i++) {
                if (cgVendors[i].vendorPhone == vendorPhone) {
                    cgVendor = cgVendors[i];
                    break;
                }
            }
        } catch (error) {
            console.log(error);
        }
        return cgVendor;
    };
    vendorsDb.add = function (vendorPhone, cgVendor) {
        var fileName = 'public/vendors';
        var cgVendors = [];
        if (fs.existsSync(fileName)) cgVendors = JSON.parse(fs.readFileSync(fileName));
        cgVendors.push(cgVendor);
        fs.writeFileSync(fileName, JSON.stringify(cgVendors));
    };
    vendorsDb.remove = function (id) {
        var fileName = 'public/vendors';
        var cgVendors = [];
        var found = false;
        try {
            if (fs.existsSync(fileName)) cgVendors = JSON.parse(fs.readFileSync(fileName));
            for (var i = 0; i < cgVendors.length; i++) {
                if (cgVendors[i].id == id) {
                    cgVendors.splice(i, 1);
                    found = true;
                    break;
                }
            }
            fs.writeFileSync(fileName, JSON.stringify(cgVendors));
        } catch (error) {
            console.log(error);
        }
        return found;
    };
    vendorsDb.update = function (id, cgVendor) {
        var fileName = 'public/vendors';
        var cgVendors = [];
        var found = false;
        try {
            if (fs.existsSync(fileName)) cgVendors = JSON.parse(fs.readFileSync(fileName));
            for (var i = 0; i < cgVendors.length; i++) {
                if (cgVendors[i].id == id) {
                    found = true;
                    for (var key in cgVendor) {
                        var cgVendorObj = cgVendors[i];
                        cgVendorObj[key] = cgVendor[key];
                        //alert('key: ' + key + '\n' + 'value: ' + obj[key]);
                    }
                    break;
                }
            }
            fs.writeFileSync(fileName, JSON.stringify(cgVendors));
        } catch (error) {
            console.log(error);
        }
        return found;
    };

    app.get('/', function (req, res) {
        res.render('index', { title: 'ClickGet.Me  ' });
    });
    app.get('/signup', function (req, res) {
        res.render('signup', { title: 'Vendor Sign Up' });
    });
    app.get('/createvendor', function (req, res) {
        res.render('createvendor', { title: 'Create Vendor' });
    });
    app.post('/savevendormenu', function (req, res) {
        
        var vendorPhone = req.param('vendorPhone', '');
        var menus = req.param('menus', '');

        if (null == vendorPhone || vendorPhone.length < 1
         || null == menus || menus.length < 1) {
            res.send(400);
            return;
        }
        var filename = 'public/vendor/' + vendorPhone + '/groups.js';
        fs.writeFile(filename, menus);
        res.send(200);
    });
    app.post('/savevendorlists', function (req, res) {

        var vendorPhone = req.param('vendorPhone', '');
        var lists = req.param('lists', '');

        if (null == vendorPhone || vendorPhone.length < 1
         || null == lists || lists.length < 1) {
            res.send(400);
            return;
        }
        var filename = 'public/vendor/' + vendorPhone + '/lists.js';
        fs.writeFile(filename, lists);
        res.send(200);
    });
    app.post('/getmenu', function (req, res) {
        var vendorPhone = req.param('vendorPhone', '');

        if (null == vendorPhone || vendorPhone.length < 1
         || null == lists || lists.length < 1) {
            res.send(400);
            return;
        }
        var filename = 'public/vendor/' + vendorPhone + '/lists.js';
        fs.writeFile(filename, lists);
        res.send(200);
    });
    app.post('/vOpt', function (req, res) {
        var phone = req.param('phone', '');
        var vOpt = req.param('vOpt', '');

        if (null == phone || phone.length < 1) {
            res.send(400);
            return;
        }
        var filename = 'public/vendor/' + phone + '/vOptions.json';
        if (vOpt) fs.writeFile(filename, vOpt); else
            res.sendfile(filename);
    });
    app.post('/sendtextmessage', function (req, res) {
        // create reusable transport method (opens pool of SMTP connections)
        var transport = nodemailer.createTransport("SMTP",{
            service: 'Gmail',
    auth: {
        user: "gmail.clickgetme@gmail.com", // service is detected from the username
        pass: "blk&phine1"
    }
});
        console.log("node transport");
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: "clickgetme@gmail.com", // sender address
            to: "noland.newton@gmail.com", // list of receivers
            subject: "test", // Subject line
            text: "Hello world ", // plaintext body
            html: "<b>Hello world </b>" // html body
        };

        // send mail with defined transport object
        transport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                res.send(500);
            } else {
                res.send(200);
            }

            // if you don't want to use this transport object anymore, uncomment following line
            //smtpTransport.close(); // shut down the connection pool, no more messages
        });

    });
    app.post('/newvendor', function (req, res) {
        var phone = req.param('phone', '');
        var vendor = req.param('vendor', '');
        var qrchtml = req.param('qrchtml', '');

        if (null == phone || phone.length < 1
         || null == vendor || vendor.length < 1
            || null == qrchtml || qrchtml.length < 1) {
            res.send(400);
            return;
        };

        var vendorString = 'var vendor =' + JSON.stringify(vendor);
        vendors[phone] = new vendorObj;
        vendors[phone].phone = phone;
        vendors[phone].name = vendor.name;
        vendors[phone].email = vendor.email;
        mkdirp('public/vendor/' + phone, function (err) {
            if (err) res.send(400);
            else {
                var vfilename = 'public/vendor/' + phone + '/vendor.js';
                fs.writeFile(vfilename, vendorString);
                var qfilename = 'public/vendor/' + phone + '/qrc.html';
                fs.writeFile(qfilename, qrchtml);
                fs.createReadStream('public/vendor/template/groups.js').pipe(fs.createWriteStream('public/vendor/' + phone + '/groups.js'));
                fs.createReadStream('public/vendor/template/lists.js').pipe(fs.createWriteStream('public/vendor/' + phone + '/lists.js'));
                fs.createReadStream('public/vendor/template/vOptions.json').pipe(fs.createWriteStream('public/vendor/' + phone + '/vOptions.json'));
            };
            
        });
        
        res.send(200);
    });
    var printQue = {};
    var offLineOrder = {};
    app.post('/vendorprint', function (req, res) {
        var phone = req.param('phone', '');
        var orderId = req.param('orderId', '');
        var order = req.param('order', '');

        if (null == phone || phone.length < 1
         || null == orderId || orderId.length < 1
            || null == order || order.length < 1) {
            res.send(400);
            return;
        };
        if (typeof printQue[phone] == "undefined") {
             printQue[phone]={"orders" : {} };
        }
        printQue[phone].orders[orderId] = order;
        res.send(200);
    });
    app.get('/vendorprint/:phone', function (req, res) {
        var phone = req.param('phone', '');
        var orderIds = [];
        var orders = [];
        var orderId = "";
        var order = "";
        var more = false;
        if (typeof printQue[phone] != "undefined") {
            for (var i = 0; i <
                Object.keys(printQue[phone].orders).length; i++) {
                var key = Object.keys(printQue[phone].orders)[i];
                orderIds.push(key);
                orders.push(rtfFormate(JSON.parse(printQue[phone].orders[key])));
            }
            if (orderIds.length) {
                if (orderIds.length > 1) more = true;
                orderId = orderIds[0];
                order = orders[0];
            };
        }
        res.send({ "orderId": orderId, "order": order, "more": more });
    });

    app.post('/offlineorder', function (req, res) {
        var phone = req.param('phone', '');
        var orderId = new Date().getTime().toString();
        var order = req.param('order', '');

        if (null == phone || phone.length < 1
         || null == order || order.length < 1) {
            res.send(400);
            return;
        };
        if (typeof offLineOrder[phone] == "undefined") {
            offLineOrder[phone] = { "orders": {} };
        };
        order.id = orderId;
        order.status = "offline";
        offLineOrder[phone].orders[orderId] = order;
        res.send(order);
    });

    app.get('/offlineorder/:phone', function (req, res) {
        var phone = req.param('phone', '');
        if (null == phone || phone.length < 1) {
            res.send(400);
            return;
        };
        var orders = [];
        if (typeof offLineOrder[phone] != "undefined") {
            for (var i = 0; i <
                Object.keys(offLineOrder[phone].orders).length; i++) {
                var key = Object.keys(offLineOrder[phone].orders)[i];
                orders.push(offLineOrder[phone].orders[key]);
            }
        }
        res.send(orders);
    });
    app.get('/offLineCancel/:phone/:order', function (req, res) {
        var phone = req.param('phone', '');
        var order = req.param('order', '');
        if (null == phone || phone.length < 1
            || null == order || order.length < 1) {
            res.send(400);
            return;
        };
        delete offLineOrder[phone].orders[order];
        res.send(200);
    });
    app.get('/printed/:phone/:order', function (req, res) {
        var phone = req.param('phone', '');
        var order = req.param('order', '');
        if (null == phone || phone.length < 1
            || null == order || order.length < 1) {
            res.send(400);
            return;
        };
        delete printQue[phone].orders[order];
        res.send(200);
    });
    function nocache(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    }
    function sendMenuContent(req, res) {
        var localPath = 'public/vendor/' + req.params.phone + "/groups.js";
        var mimeType = '';
        fs.readFile(localPath, 'utf8', function (err, contents) {
            if (!err && contents) {
                res.header('Content-Type', mimeType);
                res.header('Content-Length', contents.length);
                res.end(contents);
            } else {
                res.writeHead(500);
                res.end();
            }
        });
    }
    app.get('/menus/:phone', nocache, sendMenuContent);

    app.get('/vendors', function (req, res) {
        var rVendors = [];
        fs.readdirSync('public/vendor').forEach(function (file) {
            if (file[0] == '.') return;
            var vendorName = file.toString();
            rVendors.push(vendorName);
        });
        res.send(JSON.stringify(rVendors));
    });
    app.get('/vendorLive/:phone', function (req, res) {
        var phone = req.param('phone', '');
        var isOnline = false;
        var custCount = 0;
        if (typeof vendors[phone] != "undefined") {
            isOnline = vendors[phone].isOnline;
            custCount = vendors[phone].customers;
        }
        res.send({ "isOnline": isOnline, "custCount": custCount });
    });
    app.post('/vcust', function (req, res) {

        var phone = req.param('phone', '');
        var customers = req.param('customers', '');

        if (null == phone || phone.length < 1
         || null == customers || customers.length < 1) {
            res.send(400);
            return;
        }
        var filename = 'public/vendor/' + phone + '/customers.json';
        fs.writeFile(filename, customers);
        res.send(200);
    });
    app.get('/vcust/:phone', function (req, res) {
        var phone = req.param('phone', '');
        if (null == phone || phone.length < 1) {
            res.send(400);
            return;
        }
        var file = 'public/vendor/' + req.params.phone + '/customers.json';
        fs.exists(file, function (exists) {
            if (exists) {
                res.sendfile(file);
            } else {
                res.send([]);
            }
        });
    });
    app.get('/vendorOptions', function (req, res) {
        var file = 'public/vendor/vendorOptions.json';
        res.sendfile(file);

    });
    app.get('/vendorOffline/:phone/:sessionId', function (req, res) {
        var phone = req.param('phone', '');
        var sessionId = req.param('sessionId', '');
        if (typeof vendors[phone] != "undefined") {
            vendors[phone].isOnline = false;
            vendors[phone].sessions.remove(sessionId);
        };
    });
    app.post('/vendorEndSession', function (req, res) {
        var phone = req.param('phone', '');
        var sessionId = req.param('sessionId', '');
        if (typeof vendors[phone] != "undefined") {
            vendors[phone].sessions.remove(sessionId);
        };
        res.send(200);
    });
    app.get('/vendorOnline/:phone', function (req, res) {
        var phone = req.param('phone', '');
        var isOnline = false;
        if (typeof vendors[phone] != "undefined") {
            isOnline = vendors[phone].isOnline;
        }
        res.send({ "isOnline": isOnline });
    });
    app.get('/vendorOnlineSet/:phone/:sessionId/:isOnline', function (req, res) {
        var phone = req.param('phone', '');
        var isOnline = req.param('isOnline', '');
        var sessionId = req.param('sessionId', '');
        if (typeof vendors[phone] == "undefined") {
            vendors[phone] = { "orderNumber": 1, "sessions": [], "isOnline": isOnline };
        };
        if (typeof vendors[phone].sessions == "undefined") vendors[phone].sessions = [];
        if (vendors[phone].sessions.indexOf(sessionId) == -1)
            vendors[phone].sessions.push(sessionId);
        vendors[phone].isOnline = isOnline;
        res.send("OK");
    });
    function getOrderNumber(vendorPhone) {
        var filename = 'public/vendor/' + vendorPhone + '/orderNumber';
        var orderNumber = 1;
        if (fs.existsSync(filename)) {
            orderNumber = parseInt(fs.readFileSync(filename));
        }
        return orderNumber;
    };
    function setOrderNumber(vendorPhone, orderNumber) {
        var filename = 'public/vendor/' + vendorPhone + '/orderNumber';
        fs.writeFileSync(filename, orderNumber.toString());
    }
    app.get('/vendOrderNum/:phone', function (req, res) {
        var phone = req.param('phone', '');
        var number;
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        vendors[phone].orderNumber = getOrderNumber(vendorPhone);
        number = vendors[phone].orderNumber;
        res.send(number.toString());
    });
    app.post('/vendOrderNum', function (req, res) {
        var phone = req.param('phone', '');
        var number = req.param('number', '');
        if (null == phone || phone.length < 1) {
            res.send(400);
            return;
        }
        setOrderNumber(phone, number);
        res.send(number.toString());
    });
    app.get('/vendSessions/:phone', function (req, res) {
        var phone = req.param('phone', '');
        var sessions = [];
        if (typeof vendors[phone] != "undefined") sessions=vendors[phone].sessions;
        res.send(sessions);
    });
    app.get('/vendorAdminUrl', function (req, res) {
        var url = null;
        var roles = [];
        if (req.session && req.session.loggedIn && req.session.vendorPhone && req.session.userId) {
            var sRoles = req.session.roles;
            if (sRoles.indexOf("driver") >= 0) url = "/orderview/" + req.session.vendorPhone;
            if (sRoles.indexOf("prep") >= 0) url = "/orderview/" + req.session.vendorPhone;
            if (sRoles.indexOf("server") >= 0) url = "/orderview/" + req.session.vendorPhone;
            if (sRoles.indexOf("register") >= 0) url = "/orderview/" + req.session.vendorPhone;
            if (sRoles.indexOf("admin") >= 0) url = "/orderview/" + req.session.vendorPhone;
        } else {
            res.send(401);
        }
        res.send({"url": url, "roles": roles});
    });
    app.post('/vendorOnline', function (req, res) {
        var phone = req.param('phone', '');
        var isOnline = req.param('isOnline', '');
        if (null == phone || phone.length < 1
		|| null == isOnline || isOnline.length < 1
		) {
            res.send(400);
            return;
        }
        vendors[phone].isOnline = isOnline;
        res.send(isOnline);
    });
}
