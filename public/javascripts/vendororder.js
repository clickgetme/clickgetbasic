function Order(order) {
    var self = this;
    self.id = ko.observable(order.id);
    self.number = ko.observable(order.number);
    self.pickuptime = ko.observable(order.pickuptime);
    self.orderphone = ko.observable(order.orderphone);
    self.ordername = ko.observable(order.ordername);
    self.ordermail = ko.observable(order.ordermail);
    self.orderDay = ko.observable(order.orderDay);
    self.date = ko.observable(order.date);
    self.total = ko.observable(order.total);
    self.status = ko.observable(order.status);
    self.from = ko.observable(order.from);
    self.time = ko.observable(order.time);
    self.orderLines = ko.observableArray(order.orderLines);
    self.dinetype = ko.observable(order.dinetype);
    self.deliveryLocation = ko.observable(order.deliveryLocation);
    self.ready = ko.observable(true);
    self.process = ko.observable(true);
    self.deliver = ko.observable(true);
    self.close = ko.observable(true);
    self.user = order.user;
    var external = true;
    if (typeof order.external == 'string' || order.external instanceof String) {
        if (order.external == "false" || order.external == "") external = false;
    } else external = order.external;

    self.external = ko.observable(external);
};

function Users(vendor) {
    var self = this;
    self.users = ko.observableArray();
    self.newusername = ko.observable();
    self.userpassword = ko.observable();
    self.newuserpassword = ko.observable();
    self.newuserchange = ko.observable(true);
    self.vendorPhone = vendor.phone;
    self.userexsist = function (name) {
        var exsist = false;
        for (var i = 0; i < self.users().length; i++) {
            if (self.users()[i].username == name) exsist = true;
        };
        return exsist;
    };
    self.addNewUser = function () {
        var name = $('#newusername').val();
        var password = $('#newuserpassword').val();
        var mustcheck = $('#changepassword').val() == 'on';
        var userId = new Date().getTime().toString();
        if (name=="") return;

       
            jQuery.ajax({
                type: "POST",
                data: { "vendorPhone": vendor.phone, "user": { "userName": name, "id": userId, "password": password, "roles": ["user"], "mustchange": mustcheck } },
                url: '/addUser',
                success: function () {
                    self.users.push({ "username": name, "userid": userId });

                },
                async: false
            });
   

    };
    self.removeUser = function (userId) {
        jQuery.ajax({
            type: "POST",
            data: { "vendorPhone": self.vendorPhone, "id": userId },
            url: '/removeUser',
            success: function () {
                self.users.valueHasMutated();

            },
            async: false
        });
    };
    self.saveUser = function (userId, password) {
        jQuery.ajax({
            type: "POST",
            data: { "vendorPhone": self.vendorPhone, "id": userId, "password": password },
            url: '/saveUser',
            success: function () {
                self.users.valueHasMutated();

            },
            async: false
        });
    };
    self.getUsers = function() {
        jQuery.ajax({
            type: "GET",
            url: '/users/' + vendor.phone,
            success: function (data) {
                self.users.removeAll();
                var userdata = JSON.parse(data);
                for (var i = 0; i < userdata.length; i++) {
                    self.users.push({ "username": userdata[i].userName, "userid": userdata[i].id, "password": userdata[i].password  });
                }
            }
        });
    };

}

function MyOrders(socket, sessionId, vendor, powercontrol) {
    var self = this;
    self.allOrders = {};
    self.pTitle = { "received": "Incoming", "processing": "Processicng", "ready": "Ready" };
    self.pClass = { "received": "Incoming", "processing": "Processicng", "ready": "Ready" };

    self.pTitleLable =ko.observable();
    self.vOrders = {};
    self.inOrders = ko.observableArray();
    self.closedOrders = ko.observableArray();
    self.processingOrders = ko.observableArray();
    self.deliveryOrders = ko.observableArray();
    self.views = ko.observableArray([{ title: "Incoming", "selected": true, vcount: function() {return self.inOrders().length} },
        { title: "Processing", "selected": true, vcount: function() {return self.processingOrders().length} },
        { title: "Ready", "selected": true, vcount: function() {return self.readyOrders().length} }]);
    self.selectedOptions = ko.observableArray();
    self.options = ko.observableArray();
    self.nextOrderNumber = ko.observable();
    self.orderLocation = ko.observable();
    self.popOrderObj = ko.observable(new Order({ "id": "id", "number": "number", "pickuptime": "", "orderphone": "orderphone", "ordername": "", "ordermail": "", "orderDay": "", "date": "", "total": 0, "status": "", "from": "", "time": "", "orderLines": [], "dinetype": "", "deliveryLocation": "" }));
    self.popOrderbutton = ko.observable(
    {"ready": false, "process": false, "deliver": false, "arrive": false, "call": false, "location": false}
    );
    self.popOrder = function () {
        var orderlocationstring = "";
        var orderbuttons = { "ready": false, "process": false, "deliver": false, "arrive": false, "call": false, "location": false, "close": false };
        self.popOrderObj(this);
        if (this.dinetype() == 'Delivery') {
            orderlocationstring = 'http://maps.google.com/?q=' + this.deliveryLocation().address + ',' + this.deliveryLocation().city + ',' + this.deliveryLocation().state + ',' + this.deliveryLocation().zip;
             self.orderLocation(orderlocationstring);
        }
        if (this.status() == "received") {
            orderbuttons.process = true;
            if (this.orderphone()!="")  orderbuttons.call = true;
            if (this.dinetype() == 'Delivery') orderbuttons.location = true;
           

        }
        if (this.status() == "processing") {
            orderbuttons.ready = true;
            if (this.orderphone()!="")  orderbuttons.call = true;
            if (this.orderphone()!="")  orderbuttons.ready = true;
             if (this.dinetype() == 'Delivery') orderbuttons.location = true;

        }
        if (this.status() == "ready") {
            if (this.orderphone()!="")  orderbuttons.call = true;
            if (this.dinetype() != 'Delivery') orderbuttons.close = true;
             if (this.dinetype() == 'Delivery') orderbuttons.location = true;

        }
        if (this.status() == "delivering") {
             orderbuttons.arrive = true;
            orderbuttons.call = true;
            orderbuttons.location = true;
            orderbuttons.close = true;

        }
        self.popOrderbutton(orderbuttons);
        $('#orderpopup').popup({
            positionTo: "window", transition: "pop",
            afteropen: function (event, ui) {
                $('#otclosedlg').off('click');
                $("#otclosedlg").on('click', function () {
                    $('#orderpopup').popup("close");
                });
            }
        });
        $('#orderpopup').popup("open");
    };

    self.showDelivery = ko.observable(false);
    for (var d = 0; d < vendor.dinetypes.length; d++) {
        var dt = vendor.dinetypes[d];
        if (dt.type == "takeout") {
        };
        if (dt.type == "eatin") {
        };
        if (dt.type == "delivery") {
            self.showDelivery(true);
            self.views.push({ title: "Delivery", selected: true, vcount: function() {return self.deliveryOrders().length} });
        };
    };
    self.toggleview = function () {
        var valset = !this.selected;
        this.selected = valset;
        var orderclass = "." + this.title.toLowerCase().toString();
        var orderbutton = "#_" + this.title.toString();
        valset ? $(orderclass).show() : $(orderclass).hide();
        $(orderbutton).toggleClass("pressed");
    };
    $.each(vendor.vOpt, function (k, v) {
        $("#" + Object.keys(v)[0]).attr('checked', v[Object.keys(v)[0]]);
        // self.options.push({"key": Object.keys(v)[0], "value": v[Object.keys(v)[0]]});

    });
    self.readyOrders = ko.observableArray();
    self.loadClosed = function () {
        self.closedOrders.removeAll();
        $.get("/closedOrders/" + vendor.phone, function (xOrders) {
            var lOrders = JSON.parse(xOrders);
            if (lOrders.length) {
                for (var i = 0; i < lOrders.length; i++) {
                    var lOrder = new Order(lOrders[i]);
                    self.closedOrders.push(lOrder);
                };
            }
        });
    };
    self.getOrderNumber = function () {
        $.get("/orderNumber/" + vendor.phone, function (ordnum) {
            self.nextOrderNumber(ordnum);
        });
    };
    self.getOrderNumber();
    self.orderReset = function () {
        vendor.orderNumber = 1;
        self.nextOrderNumber(1);
        $.get("/resetOrderNumber/" + vendor.phone);
    };
    self.socket = socket;
    self.vendor = vendor;
    self.liveCustomers = ko.observableArray();

    self.liveCustomersCount = ko.computed(function () {
        return this.liveCustomers().length;
    }, this);
    self.sessionId = sessionId;
    self.initSockets = function () {
        socket.on('sendorder', function (data) {
            if (data.to == vendor.phone) self.addorder(data);
        });
        socket.on('refreshorder', function (data) {
            if ((data.phone == vendor.phone) && (data.sessionId != vendor.sessionId)) vm.myorders.refreshOrders();
        });
        socket.on('updatesession', function (data) {
            if (data.to == vendor.phone) self.updateSession(data);
        });
        socket.on('checkonline', function (data) {
            if (data.phone == vendor.phone) socket.emit('isonline', { "phone": vendor.phone, "isOnline": vendor.isOnline(), "sessionId": vendor.sessionId });
        });
    };
    
    self.moveOrder = function (from, to) {

    };
    self.refreshOrders = function () {
        $.get("/allOrders/" + vendor.phone, function (data) {
            self.vOrders = JSON.parse(data);
            self.inOrders.removeAll();
            self.readyOrders.removeAll();
            self.processingOrders.removeAll();
            for (var i = 0; i < self.vOrders.length; i++) {
                var local = self.vOrders[i];
                var order = new Order(local);
                switch (local.status) {
                    case "received":
                        self.inOrders.push(order);
                        break;
                    case "ready":
                        self.readyOrders.push(order);
                        break;
                    case "Delivering":
                        self.deliveryOrders.push(order);
                        break;
                                            case "on its way":
                        self.deliveryOrders.push(order);
                        break;
                    case "processing":
                        self.processingOrders.push(order);
                        break;
                    case "sent":
                        order.status("received");
                        self.inOrders.push(order);
                        var pdata = { "sessionId": local.from, "status": "received.", "number": local.number, "id": local.id };
                        self.socket.emit('updatestatus', pdata);
                        break;
                    default:

                        break;
                };
            }
            if (window.location.hash) $('#login').hide();
        });
    };
    self.refreshOrders();
    self.updateOrder = function (uOrder, uStatus, uMessage) {
        
        var uOrderId = uOrder.id;
        var uOrderNumber = uOrder.number;
        var uSessionId = uOrder.from;
        
        if ($("#orderpopup").hasClass("ui-popup")) {
            $('#orderpopup').popup("close");


        }

        var sdata = { "sessionId": uSessionId, "status": uStatus, "number": uOrderNumber, "id": uOrderId, "message": uMessage };
        var rdata = { "sessionId": self.sessionId, "status": uStatus, "vendorPhone": vendor.phone, "orderId": uOrderId, "message": uMessage };
        jQuery.ajax({
            type: "POST",
            data: { "vendorPhone": vendor.phone, "orderId": uOrderId, "status": uStatus },
            url: '/updateOrder',
            success: function () {
                self.socket.emit('updatestatus', sdata);
                self.socket.emit('remote', rdata);

            },
            async: false
        });
    };
    self.cancelOrder = function (orderId) {
        clearTimeout(alarms[orderId]);
        delete alarms[orderId];
    };

    self.remoteProcess = function(rOrderId) {
        var rOrder = null;
        var orders = self.inOrders();
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].id() == rOrderId) {
                rOrder = orders[i];
                rOrder.status("processing");
                break;
            }
        }
        if (!rOrder) return;
        // alarm code refactor  7/14/2014
        clearTimeout(alarms[rOrderId]);
        delete alarms[rOrderId];
        $.ionSound.stop("Alarm");
        self.processingOrders.push(rOrder);
        self.inOrders.remove(rOrder);
        self.inOrders.valueHasMutated();
    };
    self.processOrder = function () {
        if (!this.process()) return;

        // alarm code refactor  7/14/2014
        clearTimeout(alarms[this.id()]);
        delete alarms[this.id()];
        $.ionSound.stop("Alarm");
        var porder = this;
        var position = "#p" + this.id();
        var pStatus = "processing";
        this.status(pStatus);
        this.process(false);
        var pOrder = { "id": porder.id(), "number": porder.number(), "from": porder.from() };
        self.processingOrders.push(porder);
        self.inOrders.remove(porder);
        self.inOrders.valueHasMutated();
        self.updateOrder(pOrder, pStatus,"");
       
    };

    self.readyIn = function () {

        // alarm code refactor  7/14/2014
        clearTimeout(alarms[this.id()]);
        delete alarms[this.id()];
        $.ionSound.stop("Alarm");
        var porder = this;
        var position = "#ri" + this.id();
        function finish(message) {
            var pOrder = { "id": porder.id(), "number": porder.number(), "from": porder.from() };
            self.processingOrders.push(porder);
            self.inOrders.remove(porder);
            self.inOrders.valueHasMutated();
            self.updateOrder(pOrder, pStatus, message);
            $('#orderReadyIn').popup("close");
        }
        $('#orderReadyIn').popup({
            positionTo: position, transition: "pop", dismissible: false, afteropen: function (event, ui) {
                $('.readytime').off('click');
                $('.readytime').on('click', function () {
                    var readytime = $(this).text();
                    finish("Ready in " + readytime);
                });
                $('#orderReadyclose').off('click');
                $('#orderReadyclose').on('click', function () {
                    $('#orderReadyIn').popup("close");
                });
                $('#readymessage').keyup(function (e) {
                    if (e.keyCode == 13) {
                        var message = $('#readymessage').val();
                        finish(message);
                    }
                });
            }
        });
        $('#orderReadyIn').popup("open");

        var pStatus = "processing";
        this.status(pStatus);
        this.process(false);
        

    };
    self.remoteReady = function (rOrderId) {
        var rorder = null;
        var proc = self.processingOrders();
        for (var i = 0; i < proc.length; i++) {
            if (proc[i].id() == rOrderId) {
                rorder = proc[i];
                rorder.status("ready");
                break;
            }
        }
        if (!rorder) return;
        self.readyOrders.push(rorder);
        self.processingOrders.remove(rorder);
        self.processingOrders.valueHasMutated();
    };
    self.readyOrder = function () {
        var rStatus = "ready";
        var rOrder = { "id": this.id(), "number": this.number(), "from": this.from() };
        this.status(rStatus);
        this.ready(false);
        self.readyOrders.push(this);
        self.processingOrders.remove(this);
        self.processingOrders.valueHasMutated();
        self.updateOrder(rOrder, rStatus, "");
    };
    self.remoteDeliver = function (dOrderId) {
        var dorder = null;
        var proc = self.readyOrders();
        for (var i = 0; i < proc.length; i++) {
            if (proc[i].id() == dOrderId) {
                dorder = proc[i];
                dorder.status("Delivering");
                break;
            }
        }
        if (!dorder) return;
        self.deliveryOrders.push(dorder);
        self.readyOrders.remove(dorder);
        self.readyOrders.valueHasMutated();
    };
    self.deliverOrder = function () {
        var dStatus = "Delivering";
        var dOrder = { "id": this.id(), "number": this.number(), "from": this.from() };
        this.status(dStatus);
        this.deliver(false);
        self.deliveryOrders.push(this);
        self.readyOrders.remove(this);
        self.readyOrders.valueHasMutated();
        self.updateOrder(dOrder, dStatus, "on its way");
    };
    self.customerOrders = ko.computed(function () {
        var inorder = this.inOrders();
        if (typeof inorder == "undefined") inorder = [];
        var ready = this.readyOrders();
        if (typeof ready == "undefined") ready = [];
        var proc = this.processingOrders();
        if (typeof proc == "undefined") proc = [];
        var cust = [];
        return cust.concat(inorder, proc, ready);
    }, this);
    self.remoteClose = function (rOrderId) {
        var rorder = null;
        var proc = self.readyOrders();
        for (var i = 0; i < proc.length; i++) {
            if (proc[i].id() == rOrderId) {
                rorder = proc[i];
                self.readyOrders.remove(rorder);
                self.readyOrders.valueHasMutated();
                break;
            }
        }
        var delo = self.deliveryOrders();
        for (var i = 0; i < delo.length; i++) {
            if (delo[i].id() == rOrderId) {
                rorder = delo[i];
                self.deliveryOrders.remove(rorder);
                self.deliveryOrders.valueHasMutated();
                break;
            }
        }
       return;
    };

    self.connect = { "phone": vendor.phone };
    self.checkconnect = function() {
        self.socket.emit('custconnect', self.connect);
    };
    self.closeOrder = function () {
        var cStatus = "closed";
        var cOrder = { "id": this.id(), "number": this.number(), "from": this.from() };
        this.status(cStatus);
        this.close(false);
        self.readyOrders.remove(this);
        self.readyOrders.valueHasMutated();
        self.updateOrder(cOrder, cStatus, "");
        setTimeout(function () {
            self.socket.emit('custconnect', self.connect);
        }, 2000);
        if ($("#orderpopup").hasClass("ui-popup")) {
            $('#orderpopup').popup("close");


        }
    };
    self.remoteDeliver = function (rOrderId) {
        var rorder = null;
        var proc = self.readyOrders();
        for (var i = 0; i < proc.length; i++) {
            if (proc[i].id() == rOrderId) {
                rorder = proc[i];
                break;
            }
        }
        if (!rorder) return;
        // if delivery self.deliveryOrders.push(rorder);
        self.deliveryOrders.remove(rorder);
        self.deliveryOrders.valueHasMutated();
    };
    self.closeDeliveryOrder = function () {
        var cStatus = "closed";
        var cOrder = { "id": this.id(), "number": this.number(), "from": this.from() };
        this.status(cStatus);
        this.close(false);
        self.deliveryOrders.remove(this);
        self.deliveryOrders.valueHasMutated();
        self.updateOrder(cOrder, cStatus, "");
        setTimeout(function() {
            self.socket.emit('custconnect', self.connect);
        }, 2000);
    };
    
        self.arriveDeliveryOrder = function () {
        var cStatus = "arrived";
        var cOrder = { "id": this.id(), "number": this.number(), "from": this.from() };
        this.status(cStatus);
        self.updateOrder(cOrder, cStatus, "");
    };
    self.addorder = function (newOrder) {
        var aOrder = { "id": newOrder.id, "number": newOrder.number, "from": newOrder.from };
        var xorder = new Order(newOrder);
        xorder.status("received");
        if (newOrder.external) {
            $.ionSound.play("Ringin");
            alarms[newOrder.id] = setTimeout("alarm()", 120000);
        }
        self.inOrders.push(xorder);
        // $("#"+newOrder.id).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).show();
        self.updateOrder(aOrder, "received", "");
        self.getOrderNumber();
        if (vendor.options["autoprint"]) orderPrint(vendor.phone, newOrder.id, JSON.stringify(newOrder));
        self.socket.on('cancelorder', function (cOrder) {
            if (cOrder.phone != vendor.phone) return;
            var rorders = self.inOrders();
            var ri = -1;
            for (var i = 0; i < rorders.length; i++) {
                if (rorders[i].id() == cOrder.id) { ri = i; break; }
            }
            rorders.splice(ri, 1);
            self.inOrders.valueHasMutated();
            self.cancelOrder(cOrder.id);
        });
    };
    self.initSockets();
    self.clearorders = function () {
        self.orders.length = 0;
        self.orders.removeAll();
    };
    self.updateSession = function (sessionOrder) {

        var found = false;
        var status = "";
        for (var i = 0; i < self.inOrders().length; i++) {
            if (self.inOrders()[i].id() == sessionOrder.id) {
                self.inOrders()[i].from(sessionOrder.from);
                found = true;
                status = "received";
                break;
            }
        }
        if (!found) {
            for (var r = 0; r < self.readyOrders().length; r++) {
                if (self.readyOrders()[r].id() == sessionOrder.id) {
                    self.readyOrders()[r].from(sessionOrder.from);
                    found = true;
                    status = "ready";
                    break;
                }
            }
        }
        if (!found) {
            for (var p = 0; p < self.processingOrders().length; p++) {
                if (self.processingOrders()[p].id() == sessionOrder.id) {
                    self.processingOrders()[p].from(sessionOrder.from);
                    found = true;
                    status = "processing";
                    break;
                }
            }
        }
        if (found) {
            var aOrder = { "id": sessionOrder.id, "number": sessionOrder.number, "from": sessionOrder.from };
            self.updateOrder(aOrder, status, sessionOrder.message);
        }
    };
};