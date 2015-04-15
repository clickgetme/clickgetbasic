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

};
Array.prototype.indexOf = function arrayObjectIndexOf(property, value) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][property] === value) return i;
    }
    return -1;
};

function MyOrders(socket, sessionId, vendor, allOrders) {
    var myorders = this;
    myorders.allOrders = allOrders;
    myorders.inOrders = ko.observableArray();
    myorders.processingOrders = ko.observableArray();
    myorders.readyOrders = ko.observableArray();
    myorders.socket = socket;
    myorders.vendor = vendor;
    var local = {};
    var order = {};
    for (var i = 0; i < allOrders.length; i++) {
        local = allOrders[i];
        order = new Order(local);

        switch (local.status) {

            case "received":
                myorders.inOrders.push(order);
                break;

            case "ready":
                myorders.readyOrders.push(order);
                break;

            case "processing":
                myorders.processingOrders.push(order);
                break;

            default:

                break;
        };
        
    }
    
    myorders.removeOrder = function () {
        var data = { sessionId: this.from, status: "Close" };
        myorders.socket.emit('updatestatus', data);
        myorders.orders.remove(this);
    };
    myorders.processOrder = function () {

        if (this.process) {
            var data = { sessionId: this.from(), status: "Processing." };
            

            this.status("Processing");
            this.process(false);
            myorders.socket.emit('updatestatus', data);
            var processing = ko.toJS(this);  // ko.toJSON(this);
            var lines = this.orderLines;
            myorders.allOrders[myorders.allOrders.indexOf('id', processing.id)].status = 'processing';
            localStorage.setItem('allOrders', JSON.stringify(myorders.allOrders));
            //var order = new Order(processing);
            myorders.processingOrders.push(this);
            myorders.inOrders.remove(this);
        };
        
    };
    myorders.readyOrder = function () {
        if (this.ready) {
            var data = { sessionId: this.from(), status: "Ready!" };            
            this.status("Ready");
            this.ready (false);
            myorders.socket.emit('updatestatus', data);
            var ready = ko.toJS(this);  // ko.toJSON(this);
            myorders.allOrders[myorders.allOrders.indexOf('id', ready.id)].status = 'ready';
            localStorage.setItem('allOrders', JSON.stringify(myorders.allOrders));
            myorders.readyOrders.push(this);
            myorders.processingOrders.remove(this);
        };
        //ko.mapping.fromJS(myorders.orders(), vm.myorders);
    };
    myorders.closeOrder = function () {
        var data = { sessionId: this.from(), status: "Close" };
        this.status("Closed");
        this.close(false);
        myorders.socket.emit('updatestatus', data);
        var close = ko.toJS(this);  // ko.toJSON(this);
        myorders.allOrders[myorders.allOrders.indexOf('id', close.id)].status = 'closed';
        localStorage.setItem('allOrders', JSON.stringify(myorders.allOrders));
        myorders.readyOrders.remove(this);
    };
    myorders.addorder = function (newOrder) {       
        if (newOrder) {            
                     
            var ordernumber = vendor.getOrderNumber();
            newOrder.id = new Date().getTime().toString();
            newOrder.status = "received";
            newOrder.number = ordernumber;
            var order = new Order(newOrder);
            myorders.allOrders.push(newOrder);
            myorders.inOrders.push(order);
            localStorage.setItem('allOrders', JSON.stringify(myorders.allOrders));
            var data = { sessionId: newOrder.from, status: "Received" };
            myorders.socket.emit('updatestatus', data);
        };
    };

    myorders.clearorders = function () {
        myorders.orders.length = 0;
        myorders.orders.removeAll();
    };
};

var orderNumber = localStorage.getItem("orderNumber");
if (!orderNumber) orderNumber = 1;

vendor.sessionId = "";
vendor.isOnline = ko.observable(false);
vendor.orderNumber = orderNumber;

vendor.getOrderNumber = function () {
    var o = this.orderNumber;
    this.orderNumber++;
    localStorage.setItem("orderNumber", this.orderNumber.toString());
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
    var allOrders = localStorage.getItem('allOrders');
    $("#vendorisOnline").click(function () {
        if ($("#vendorisOnline").is(":checked")) {
            vendor.isOnline = true;
        } else {
            vendor.isOnline = false;
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

