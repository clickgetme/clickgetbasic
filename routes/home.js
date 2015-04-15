module.exports = function (app, clickget) {
  
    // home page
       var fs = require('fs');
       var vendors = clickget.vendors;
    app.get('/', function (req, res) {
        res.render('index', { title: 'ClickGet.Me  ' });
    });
    app.get('/startup', function (req, res) {
        res.render('startup', { title: 'ClickGet.Me  ' });
    });
    app.get('/qrctext', function (req, res) {
        var file = 'public/vendor/template/qrc.txt';
        fs.exists(file, function (exists) {
            if (exists) {
                res.sendfile(file);
            } else {
                res.send("");
            }
        });
    });
    app.get('/orders/:phone', function (req, res) {

        res.render('orders', { title: 'OrderTaker ', phone: req.params.phone });
    });
    app.get('/orderview/:phone', function (req, res) {

        res.render('orderview', { title: 'OrderTaker ', phone: req.params.phone });
    });
    app.get('/admin/:phone', function (req, res) {

        res.render('admin', { title: 'Vendor Admin ', phone: req.params.phone });
    });
    app.get('/customer', function (req, res) {

        res.render('customer');
    });
    app.get('/menubuilder/:phone', function (req, res) {
         var phone = req.params.phone;
        if (typeof vendors[phone] == 'undefined') {
            res.render('notavendor');
                return;
        };
        res.render('menubuilder', { title: 'Menubuilder', phone:phone });
    });
    app.get('/orderfrom/:phone', function (req, res) {
        var phone = req.params.phone;
        if (typeof vendors[phone] == 'undefined') {
            res.render('notavendor');
                return;
        };
        res.render('orderfrom', { title: vendors[phone].name , phone: phone });
    });

    app.get('/qrc/:phone', function (req, res) {
        var filename = 'public/vendor/' + req.params.phone + "/qrc.html";
        res.sendfile(filename);
    });
    app.get('/sample', function (req, res) {
        res.render('sample');
    });
    app.get('/schedule/:phone', function (req, res) {
        var file = 'public/vendor/' + req.params.phone + "/schedule.json";
        fs.exists(file, function (exists) {
            if (exists) {
                res.sendfile(file);
            } else {
                res.sendfile('public/vendor/template/schedule.json');
            }
        });
    });
    app.post('/schedule', function (req, res) {
        var phone = req.param('phone', '');
        var schedule = req.param('schedule', '');

        if (null == phone || phone.length < 1
         || null == schedule || schedule.length < 1) {
            res.send(400);
            return;
        };
        var filename = 'public/vendor/' + phone + '/schedule.json';
        fs.writeFile(filename, schedule);
        res.send(200);
    });
    app.get('/whoami/:phone', function (req, res) {
        var phone = req.params.phone;
        res.render('whoami', { title: title[phone], phone: phone });
    });
    app.get('/vendorLogin', function (req, res) {

        res.render('vendorLogin', { title: "Login"});
    });
        app.get('/ordertakerdemo', function (req, res) {

        res.render('ordertakerdemo');
    });
}


