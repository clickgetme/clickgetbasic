function Order(order) {
    var self = this;
    self.id = ko.observable(order.id);
    self.number = ko.observable(order.number);
    self.orderphone = ko.observable(order.orderphone);
    self.ordername = ko.observable(order.ordername);
    self.ordermail = ko.observable(order.ordermail);
    self.date = ko.observable(order.date);
    self.total = ko.observable(order.total);
    self.status = ko.observable(order.status);
    self.from = ko.observable(order.from);
    self.time = ko.observable(order.time);
    self.orderLines = ko.observableArray(order.orderLines);
    self.ready = ko.observable(true);
    self.process = ko.observable(true);
    self.close = ko.observable(true);
    self.user = order.user;

};
Array.prototype.indexOf = function arrayObjectIndexOf(property, value) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][property] === value) return i;
    }
    return -1;
};

function MyOrders(socket, sessionId, vendor, allOrders) {
    var myorders = this;
    self.allOrders = allOrders;
    self.inOrders = ko.observableArray();
    self.localOrders = ko.observableArray();
    self.processingOrders = ko.observableArray();
    self.readyOrders = ko.observableArray();
    self.socket = socket;
    self.vendor = vendor;
    var local = {};
    var order = {};
    for (var i = 0; i < allOrders.length; i++) {
        local = allOrders[i];
        order = new Order(local);

        switch (local.status) {

            case "received":
                self.inOrders.push(order);
                break;

            case "ready":
                self.readyOrders.push(order);
                break;

            case "processing":
                self.processingOrders.push(order);
                break;

            default:

                break;
        };

    }
    self.showAll =function () {

        self.localOrders(self.allOrders);
        $('#localorders').popup({ positionTo: "window", overlayTheme: "b", theme: "a", dismissible: true, transition: "pop" });
        $('#localorders').popup("open");
        $('#localorders').draggable();
    };
    self.removeOrder = function () {
        var data = { sessionId: this.from, status: "Close" };
        self.socket.emit('updatestatus', data);
        self.orders.remove(this);
    };
    self.processOrder = function () {

        if (this.process) {
            var data = { sessionId: this.from(), status: "Processing." };
            

            this.status("Processing");
            this.process(false);
            self.socket.emit('updatestatus', data);
            var processing = ko.toJS(this);  // ko.toJSON(this);
            var lines = this.orderLines;
            self.allOrders[self.allOrders.indexOf('id', processing.id)].status = 'processing';
            amplify.store('allOrders', JSON.stringify(self.allOrders));
            //var order = new Order(processing);
            self.processingOrders.push(this);
            self.inOrders.remove(this);
        };
        
    };
    self.readyOrder = function () {
        if (this.ready) {
            var data = { sessionId: this.from(), status: "Ready!" };            
            this.status("Ready");
            this.ready (false);
            self.socket.emit('updatestatus', data);
            var ready = ko.toJS(this);  // ko.toJSON(this);
            var ruser = this.user;
            if (typeof ruser != 'undefined') {
                $.post("../sendtextmessage")
                .done(function (data) {
                    alert(data);
                });

            };
            
            self.allOrders[self.allOrders.indexOf('id', ready.id)].status = 'ready';
            amplify.store('allOrders', JSON.stringify(self.allOrders));
            self.readyOrders.push(this);
            self.processingOrders.remove(this);
        };
        //ko.mapping.fromJS(self.orders(), vm.myorders);
    };
    self.closeOrder = function () {
        var data = { sessionId: this.from(), status: "Close" };
        this.status("Closed");
        this.close(false);
        self.socket.emit('updatestatus', data);
        var close = ko.toJS(this);  // ko.toJSON(this);
        self.allOrders[self.allOrders.indexOf('id', close.id)].status = 'closed';
        amplify.store('allOrders', JSON.stringify(self.allOrders));
        self.readyOrders.remove(this);
    };
    self.addorder = function (newOrder) {       
        if (newOrder) {            
                     
            var ordernumber = vendor.getOrderNumber();
            newOrder.id = new Date().getTime().toString();
            newOrder.status = "received";
            newOrder.number = ordernumber;
            var order = new Order(newOrder);
            self.allOrders.push(newOrder);
            self.inOrders.push(order);
            amplify.store('allOrders', JSON.stringify(self.allOrders));
            var data = { sessionId: newOrder.from, status: "Received", number: ordernumber };
            self.socket.emit('updatestatus', data);
        };
    };

    self.clearorders = function () {
        self.orders.length = 0;
        self.orders.removeAll();
    };
};

var orderNumber = amplify.store("orderNumber");
if (!orderNumber) orderNumber = 1;

vendor.sessionId = "";
vendor.isOnline = ko.observable(false);
vendor.orderNumber = orderNumber;

vendor.getOrderNumber = function () {
    var o = this.orderNumber;
    this.orderNumber++;
    amplify.store("orderNumber", this.orderNumber.toString());
    return o
};
function showPopup(url) {
    newwindow = window.open(url, null, 'height=600, width=350, top=100, left=100, resizable, toolbar=no, location=no');
    if (window.focus) { newwindow.focus() }
};

$(document).ready(function () {
    var isLoggedin;
    var url = "/orderfrom/" + vendor.phone + "?fromiframe=true";
    $('#ifordertaker').attr("src", url);
 //var loggedin = function () {
    var socket = io.connect();
    var allOrders = amplify.store('allOrders');
    $("#vendorisOnline").click(function () {
        if ($("#vendorisOnline").is(":checked")) {
            vendor.isOnline(true);
        } else {
            vendor.isOnline(false);
        };
        var rdata = { "phone": vendor.phone, "isOnline": vendor.isOnline() };
        socket.emit('isonline', rdata);
    });
    $(":checkbox").change(function () {
        if (!vendor.isOnline()) {
            vendor.isOnline(true);
        }
        else {
            vendor.isOnline(false);
        }
        var rdata = { "phone": vendor.phone, "isOnline": vendor.isOnline() };
        socket.emit('isonline', rdata);
    });
    $("#takeorder").click(function () {
        
        $('#ordertaker').popup({ positionTo: "window", transition: "pop" });
        $('#ordertaker').popup("open");

    });


    if (!allOrders) allOrders = []; else allOrders = jQuery.parseJSON(allOrders);
        
        var connected = false;
        socket.on("connect", function () {
            if (!connected) {
                vendor.sessionId = this.socket.sessionid;
                var myorders = new MyOrders(socket, vendor.sessionId, vendor, allOrders);
                vm = { myorders: myorders, vendor:vendor }
                ko.applyBindings(vm);
                connected = true;
            } else console.log("reconnected");
        });
        socket.on('sendorder', function (data) {
            if (data.to == vendor.phone) vm.myorders.addorder(data);
        });
        socket.on('checkonline', function (data) {
            var rdata = { "phone": vendor.phone, "isOnline": vendor.isOnline() };
            if (data.phone == vendor.phone) socket.emit('isonline', rdata)
        });
 //   };

});

