module.exports = function(app, clickget) {


    var orders = clickget.orders;
    var closedOrders = clickget.closedOrders;
    var fs = clickget.fs;
    var mkdirp = clickget.mkdirp;

    function padZeros(theNumber, max) {
        var numStr = String(theNumber);
        while (numStr.length < max) {
            numStr = '0' + numStr;
        }
        return numStr;
    };

    function orderDays() {
        var now = new Date();
        var now2 = new Date();
        var dateOffset = (24 * 60 * 60 * 1000);
        now2.setTime(now2.getTime() - dateOffset);
        var m = padZeros((now.getMonth() + 1), 2),
            d = padZeros((now.getDay() + 1), 2),
            y = now.getFullYear();
        var m2 = padZeros((now2.getMonth() + 1), 2),
            d2 = padZeros((now2.getDay() + 1), 2),
            y2 = now2.getFullYear();
        var today = y + m + d;
        var yesterday = y2 + m2 + d2;
        return { "today": today, "yesterday": yesterday };
    }

    function getOrderNumber(vendorPhone) {
        var filename = 'public/vendor/' + vendorPhone + '/orderNumber';
        var orderNumber = 1;
        if (fs.existsSync(filename)) {
            orderNumber = parseInt(fs.readFileSync(filename));
        }
        var nextOrderNumber = orderNumber + 1;
        fs.writeFileSync(filename, nextOrderNumber.toString());
        return padZeros(orderNumber, 3);

    }

    function closeOrder(vendorPhone, order) {
        var filename = 'public/vendor/' + vendorPhone + '/closedOrders';
        var cOrders = [];
        if (fs.existsSync(filename)) {
            cOrders = JSON.parse(fs.readFileSync(filename));
        }
        cOrders.push(order);
        fs.writeFileSync(filename, JSON.stringify(cOrders));
    }

    function flushOrders(vendorPhone, forders) {
        mkdirp('public/vendor/' + vendorPhone + '/orders', function(err) {
            if (err) res.send(400);
            else {
                var fname = new Date().getTime().toString() + ".json";
                var filename = 'public/vendor/' + vendorPhone + '/orders/' + fname;
                fs.writeFile(filename, JSON.stringify(forders));
            };

        });
    }

    app.post('/submitOrder', function(req, res) {
        var vendorPhone = req.param('vendorPhone', '');
        var order = req.param('order', '');
        if (null == vendorPhone || vendorPhone.length < 1
            || null == order || order.length < 1) {
            res.send(400);
            return;
        }

        if (typeof orders[vendorPhone] == "undefined") {
            orders[vendorPhone] = {};
            orders[vendorPhone].orders = [];
        };
        var orderNumber = getOrderNumber(vendorPhone);
        var orderId = new Date().getTime().toString();
        order.id = orderId;
        order.number = orderNumber;
        orders[vendorPhone].orders.push(order);
        res.send({ "orderNumber": order.number, "orderId": order.id });
    });
    app.get('/updateOrder/:vendorPhone/:orderId/:status', function(req, res) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        var vendorPhone = req.param('vendorPhone', '');
        var orderId = req.param('orderId', '');
        var status = req.param('status', '');
        var found = false;
        if (null == vendorPhone || vendorPhone.length < 1
            || null == status || status.length < 1
            || null == orderId || orderId.length < 1) {
            res.send(400);
            return;
        };
        if (typeof orders[vendorPhone] == "undefined") {
            orders[vendorPhone] = {};
            orders[vendorPhone].orders = [];
        };
        var vorders = orders[vendorPhone].orders;

        for (var i = 0; i < vorders.length; i++) {
            if (vorders[i].id == orderId) {
                orders[vendorPhone].orders[i].status = status;
                found = true;

                break;
            }
        };
        res.send(found);
    });
    app.post('/updateOrder', function(req, res) {
        var vendorPhone = req.param('vendorPhone', '');
        var orderId = req.param('orderId', '');
        var status = req.param('status', '');
        if (null == vendorPhone || vendorPhone.length < 1
            || null == status || status.length < 1
            || null == orderId || orderId.length < 1) {
            res.send(400);
            return;
        };
        if (typeof orders[vendorPhone] == "undefined") {
            res.send(400);
            return;
        };
        var vorders = orders[vendorPhone].orders;
        var found = false;
        for (var i = 0; i < vorders.length; i++) {
            if (vorders[i].id == orderId) {
                orders[vendorPhone].orders[i].status = status;
                found = true;
                if (status == "closed") {
                    var vOrder = JSON.parse(JSON.stringify(orders[vendorPhone].orders[i]));
                    closeOrder(vendorPhone, vOrder);
                    vorders.splice(i, 1);
                }
                break;
            }
        };
        if (found) res.send(200);
        else res.send(400);
    });
    app.get('/vorders', function(req, res) {
        res.send(JSON.stringify(orders));

    });
    app.get('/testflush', function(req, res) {

        flushOrders('2168897427', orders);
        res.send(200);
    });
    app.get('/backup', function(req, res) {
        var backup = { "orders": orders, "closedOrders": closedOrders };
        var filename = 'public/vendor/backup.json';
        fs.writeFile(filename, JSON.stringify(backup));
        res.send(200);
    });
    app.get('/restore', function(req, res) {
        fs.readFile('public/vendor/backup.json', 'utf8', function(err, data) {
            if (err) {
                res.send(400);
                return;
            }
            var backup = JSON.parse(data);
            orders = backup.orders;
            closedOrders = backup.closedOrders;
            res.send(200);
        });
    });
    app.get('/allOrders/:vendorPhone', function(req, res) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        var vendorPhone = req.param('vendorPhone', '');
        var allorders = new Array();
        if (typeof orders[vendorPhone] == "undefined") {
            res.send(JSON.stringify(allorders));
            orders[vendorPhone] = {};
            orders[vendorPhone].orders = [];
            return;
        };
        var vorders = orders[vendorPhone].orders;
        for (var i = 0; i < vorders.length; i++) {
            if (vorders[i].status != "canceled") {
                if (vorders[i].status != "closed") allorders.push(vorders[i]);
                else {
                    var vOrder = JSON.parse(JSON.stringify(vorders[i]));
                    closeOrder(vendorPhone, vOrder);
                    vorders.splice(i, 1);
                }
            } else vorders.splice(i, 1);
        };

        res.send(JSON.stringify(allorders));
    });
    app.get('/orderNumber/:vendorPhone', function(req, res) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        var vendorPhone = req.param('vendorPhone', '');
        var filename = 'public/vendor/' + vendorPhone + '/orderNumber';
        var orderNumber = 1;
        if (fs.existsSync(filename)) {
            orderNumber = parseInt(fs.readFileSync(filename));
        }
        res.send(padZeros(orderNumber, 3));
    });
    app.get('/resetOrderNumber/:vendorPhone', function(req, res) {
        var vendorPhone = req.param('vendorPhone', '');
        var filename = 'public/vendor/' + vendorPhone + '/orderNumber';
        try {
            fs.writeFileSync(filename, '001');
        } catch (err) {
            res.send(200);
            return;
        }
        res.send(200);
    });
    app.get('/closedOrders/:vendorPhone', function(req, res) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        var vendorPhone = req.param('vendorPhone', '');
        var filename = 'public/vendor/' + vendorPhone + '/closedOrders';
        var data = fs.readFileSync(filename);
        res.send(data);
    });
    app.post('/updateOrderSession', function(req, res) {
        var vendorPhone = req.param('vendorPhone', '');
        var orderId = req.param('orderId', '');
        var session = req.param('session', '');
        if (null == vendorPhone || vendorPhone.length < 1
            || null == session || session.length < 1
            || null == orderId || orderId.length < 1) {
            res.send(400);
            return;
        };

        if (typeof orders[vendorPhone] == "undefined") {
            res.send(404);
            return;
        };
        var retVal = { "found": false, "sessionChanged": false };
        var vorders = orders[vendorPhone].orders;
        for (var i = 0; i < vorders.length; i++) {
            if (vorders[i].id == orderId) {
                retVal = { "found": true, "sessionChanged": (vorders[i].from != session) };
                orders[vendorPhone].orders[i].from = session;
                break;
            }
        };
        res.send(retVal);
    });
    app.get('/orderprint/:phone', function(req, res) {
        var phone = req.params.phone;
        fs.readFile('public/vendor/' + phone + '/vendor.js', 'utf8', function(err, data) {
            if (err) {
                res.render('notavendor');
                return;
            }
            eval(data);
            res.render('orderprint', { title: vendor.name, phone: phone });


        });
    });
}

