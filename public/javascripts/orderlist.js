
var takeOrderLoaded = false;
var alarms = {};
function alarm() {
    $.ionSound.play("Alarm");
}



function orderPrint(phone, orderId, order) {
    $.post("/vendorprint", { phone: phone, orderId: orderId, order: order })
                .done(function (cdata) {
                    if (cdata == 'OK') return ;
                });
}
function Schedule(schedule) {
    var self = this;
    var days = $.map(schedule.days, function (n, i) {
        return { "open": ko.observable(n.open), "day": ko.observable(n.day), "openTime": ko.observable(n.openTime), "closeTime": ko.observable(n.closeTime) };
    });
    self.days = ko.observableArray(days);
    self.save = function () {
        var sdays =$.map(self.days(), function(n, i) {
                return { "open": n.open(), "day": n.day(), "openTime": n.openTime(), "closeTime": n.closeTime() };
            }
        );
        var saveSchedule = {"schedule":{"days": sdays}};
        var scheduleString = JSON.stringify(saveSchedule);
        $.post("/schedule", { phone: vendor.phone, schedule: scheduleString });
    };
}
  
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
    self.close = ko.observable(true);
    self.user = order.user;
};
function Customer(customer) {
    var self = this;
    self.name = ko.observable(customer.name);
    self.phone = ko.observable(customer.phone);
    self.email = ko.observable(customer.email);
    self.orders = ko.observable(customer.orders);
    self.total = ko.observable(customer.total);
}
function Customers(vendor) {
    var self = this;
    self.customers = ko.observableArray();
    self.custdb = {};
    self.load = function () {
        self.customers.removeAll();
        self.custdb = {};
        $.get("/closedOrders/" + vendor.phone, function (xOrders) {
            var lOrders = JSON.parse(xOrders);
            self.custdb = {};
            if (lOrders.length) {
                for (var i = 0; i < lOrders.length; i++) {
                    var lOrder = lOrders[i];
                    if (!lOrder.external) {
                        if (lOrder.orderphone == "") {
                        lOrder.orderphone = vendor.phone;
                        lOrder.ordername = "internal";
                    }
                } 
                   self.addOrder(lOrder);
                };
            }
        }); 
    };
    self.save = function () {
        var scustomers = $.map(self.customers(), function (n, i) {
            return { "name": n.name(), "email": n.email(), "phone": n.phone(), "orders": n.orders(), "total": n.total() };
        }
        );
        $.post("/vcust", { "phone": vendor.phone, "customers": JSON.stringify(scustomers) });
    };
    self.addOrder = function (order) {
        if (typeof order.mail == 'undefined') order.mail="";
        var customer;
        if (typeof self.custdb[order.orderphone] == 'undefined') {
            customer = { "name": order.ordername, "email": order.mail, "phone": order.orderphone, "orders": 0, "total": 0 };
            var cust = new Customer(customer);
            self.custdb[order.orderphone] = customer;
            self.customers.push(cust);
        } else {
            customer = self.custdb[order.orderphone];
            
        }
        customer.orders += 1;
        customer.total += parseFloat(order.total);
        self.custdb[order.orderphone] = customer;
        var customers = self.customers();
        var scustomers = $.map(customers, function (n, i) {
            return { "name": n.name(), "email": n.email(), "phone": n.phone(), "orders": n.orders(), "total": n.total() };
        }
        );
        var c = customers[scustomers.indexOf('phone', order.orderphone)];
        c.orders(customer.orders);
        c.total(customer.total.toFixed(2));
        self.custdb[order.orderphone].orders = customer.orders;
        self.custdb[order.orderphone].total = customer.total;
        //self.save();
    };

}
Array.prototype.indexOf = function arrayObjectIndexOf(property, value) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][property] === value) return i;
    }
    return -1;
};
function MyOrders(socket, sessionId, vendor) {
    var self = this;
    self.allOrders = {};
    self.vOrders = {};
    self.inOrders = ko.observableArray();
    self.closedOrders = ko.observableArray();
    self.processingOrders = ko.observableArray();
    self.selectedOptions = ko.observableArray();
    self.options = ko.observableArray();
    self.nextOrderNumber = ko.observable();
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
                    var lOrder =  new Order(lOrders[i]);
                    self.closedOrders.push(lOrder);
                };
            }
        });
    };
    self.getOrderNumber = function() {
        $.get("/orderNumber/" + vendor.phone, function (ordnum) {
            self.nextOrderNumber(ordnum);
        });
    };
    self.getOrderNumber();
    self.orderReset = function () {
       vendor.orderNumber =1;
       self.nextOrderNumber(1);
       $.get("/resetOrderNumber/" + vendor.phone );
    };
    self.socket = socket;
    self.vendor = vendor;
    self.moveOrder = function(from, to) {

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
                    case "processing":
                        self.processingOrders.push(order);
                        clearTimeout(alarms[order.id()]);
                        delete alarms[order.id()];
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
        });
    };
    self.refreshOrders();
    self.removeOrder = function () {
        var data = { sessionId: this.from, status: "Close" };
        self.socket.emit('updatestatus', data);
        self.orders.remove(this);
    };
    self.updateOrder = function (uOrder, uStatus, uMessage) {
        var uOrderId = uOrder.id;
        var uOrderNumber = uOrder.number;
        var uSessionId = uOrder.from;
        var sdata = { "sessionId": uSessionId, "status": uStatus, "number": uOrderNumber, "id": uOrderId, "message" : uMessage };
        jQuery.ajax({
            type: "POST",
            data: { "vendorPhone": vendor.phone, "orderId": uOrderId, "status": uStatus },
            url: '/updateOrder',
            success: function () {
                self.socket.emit('updatestatus', sdata);
                self.socket.emit('refreshorder', { "phone": vendor.phone, "sessionId": sessionId });
            },
            async: false
        });
    };
    self.cancelOrder = function (orderId) {
        clearTimeout(alarms[orderId]);
        delete alarms[orderId];
    };
    self.processOrder = function () {
        if (!this.process()) return;
        clearTimeout(alarms[this.id()]);
        delete alarms[this.id()];
        $.ionSound.stop("Alarm");
        var porder = this;
        var position = "#p" + this.id();
        if (this.dinetype() !="Delivery") {
        $('#orderReadyIn').popup({ positionTo: position, transition: "pop",  dismissible: false });
        $('#orderReadyIn').popup("open");
        }
        
        var pStatus = "processing";
        this.status(pStatus);
        this.process(false);
        function finish(message) {
            var pOrder = { "id": porder.id(), "number": porder.number(), "from": porder.from() };
            self.processingOrders.push(porder);
            self.inOrders.remove(porder);
            self.inOrders.valueHasMutated();
            self.updateOrder(pOrder, pStatus, message);
            $('#orderReadyIn').popup("close");
        }
        if (this.dinetype() !="Delivery") {
        $('.readytime').off('click');
        $('.readytime').on('click', function () {
            var readytime = $(this).text();
            finish("Ready in " + readytime);
            
        });

        $('#readymessage').keyup(function (e) {
            if (e.keyCode == 13) {
                var message = $('#readymessage').val();
                finish(message);
            }
        });
        } else finish("");

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
    self.closeOrder = function () {
        var cStatus = "closed";
        var cOrder = { "id": this.id(), "number": this.number(), "from": this.from() };
        this.status(cStatus);
        this.close(false);
        self.readyOrders.remove(this);
        self.readyOrders.valueHasMutated();
        self.updateOrder(cOrder, cStatus, "");
    };
    self.addorder = function (newOrder) {
        var aOrder = { "id": newOrder.id, "number": newOrder.number, "from": newOrder.from};
        var xorder = new Order(newOrder);
        xorder.status("received");
        if (newOrder.external) {
            $.ionSound.play("Ringin");
            
            alarms[newOrder.id] = setTimeout("alarm()", 30000);
        }
        
       
        self.inOrders.push(xorder);
        // $("#"+newOrder.id).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).show();
        self.updateOrder(aOrder, "received", "");
        self.getOrderNumber();
        if (vendor.options["autoprint"]) orderPrint(vendor.phone, newOrder.id, JSON.stringify(newOrder));
            self.socket.on('cancelorder', function (cOrder) {
            if (cOrder.phone != vendor.phone) return;
            
            var rorders =self.inOrders();
            var ri = -1;
            for (var i=0; i<rorders.length; i++) {
                if (rorders[i].id()== cOrder.id) {ri = i; break;}
            }
            rorders.splice(ri,1);
            self.inOrders.valueHasMutated();
                self.cancelOrder(cOrder.id);
            });
    };
    self.updateStatus = function () {

        //$("li[status='received']").css("background-color", "pink");
        //$("li[status='processing'").css("background-color", "yellow");
        //$("li[status='ready'").css("background-color", "lightgreen");

    };
    self.clearorders = function () {
        self.orders.length = 0;
        self.orders.removeAll();
    };
    self.updateSession = function(sessionOrder) {

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
        if (found){
            var aOrder = { "id": sessionOrder.id, "number": sessionOrder.number, "from": sessionOrder.from };
            self.updateOrder(aOrder, status, sessionOrder.message);
            }
};
};
// old local storage

var orderNumber;

$.ajax({
    url: "/vendOrderNum/" + vendor.phone,
    type: "GET",
    async: false,
    dataType: 'json'
}).done(function (data) {
    orderNumber = parseInt(data);
});
vendor.sessionId = "";

$.ajax({
    url: "/vendorOnline/" + vendor.phone,
    type: "GET",
    async: false,
    dataType: 'json'
    }).done(function (data) {
    vendor.isOnline =ko.observable(data.isOnline);
});

vendor.orderNumber = orderNumber;

vendor.getOrderNumber = function () {
    var o = this.orderNumber;
    this.orderNumber++;
    $.post("/vendOrderNum", { "phone": vendor.phone, "number": this.orderNumber });
    return o;
};
$.post('/vOpt', { "phone": vendor.phone }, function (vOpt) {
    vendor.vOpt = vOpt;
    vendor.options = {};
   for (var i = 0; i < vOpt.length; i++) {
     var key = Object.keys( vOpt[i])[0];
     var value = vOpt[i][Object.keys(vOpt[i])[0]];
    vendor.options[key] =value;
    };
});
var scheduleData = {};
$.ajax({
    url: "/schedule/" + vendor.phone,
    type: "GET",
    async: false,
    dataType: 'json'
}).done(function(data) {
    scheduleData = data.schedule;
});
//$.get('/schedule/' + vendor.phone,
//    function (data) {
//        scheduleData = data.schedule;
//    });
var connected = false;
$(document).ready(function () {
    // load audio
    $.ionSound({
        sounds: [
            "Ringin",
            "Logoff",
            "Logon",
            "Alarm"
        ],
        path: "/sounds/",                // set path to sounds
        multiPlay: false,               // playing only 1 sound at once
        volume: "1.0"                   // not so loud please
    });

    var url = "/orderfrom/" + vendor.phone + "?fromiframe=true";
    $('#ifordertaker').attr("src", url);
    var iframe = document.getElementById('ifordertaker');
    iframe.src = iframe.src;
    var vm = {};
    
 //var loggedin = function () {
    var socket = io.connect();
    $("#vendorisOnline").on('click', function () {
        if ($("#vendorisOnline").is(":checked")) {
            vendor.isOnline(true);

        } else {
            vendor.isOnline(false);
        };
       
        var url = "/orderfrom/" + vendor.phone + "?fromiframe=true";
        $('#ifordertaker').attr("src", url);
        iframe = document.getElementById('ifordertaker');
        iframe.src = iframe.src;
    });
    $("#custall").change(function () {
        $(".custs").prop('checked', $("#custall").is(':checked'));
    });
    function vendorchange(){
        if ($("#vendorisOnline:checkbox").is(':checked')) {
            vendor.isOnline(true);
            $("#onlineLable").text("Online");
            $("#power").css("background-image", "url(/styles/poweron.png)");
            $.ionSound.play("Logon");
           // if (cgAudio) sndLogon.play();
        }
        else {
            vendor.isOnline(false);
            $("#onlineLable").text("Offline");
            $("#power").css("background-image", "url(/styles/poweroff.png)");
            $.ionSound.play("Logoff");
          //  if (cgAudio) sndLogoff.play();
        }
        $.get("/vendorOnlineSet/" + vendor.phone + "/" + vendor.sessionId + "/" + vendor.isOnline());
        var rdata = { "phone": vendor.phone, "isOnline": vendor.isOnline(), "sessionId": vendor.sessionId  };
        socket.emit('isonline', rdata);
    }
    $("#vendorisOnline:checkbox").change(function (){
        vendorchange();
    } );
    $("#takeorder").on('click', function () {
        if (!vendor.isOnline()) {
            alert("Go Online");
            return;
        }
        //if (!takeOrderLoaded) {
        //    var url = "/orderfrom/" + vendor.phone + "?fromiframe=true";
        //    $('#ifordertaker').attr("src", url);
        //    var iframe = document.getElementById('ifordertaker');
        //    iframe.src = iframe.src;
        //    takeOrderLoaded = true;
        //}
        $('#takeorderclose').off('click');
        $("#takeorderclose").on('click', function () {
            $('#ordertaker').popup("close");
        });
        $('#ordertaker').popup({ positionTo: "window", transition: "pop" });
        $('#ordertaker').popup("open"); //.draggable({ handle: "h1" });

    });

    $("#managemenu").on('click', function () {
        var domain = window.location.origin;
        window.open(domain + "/menubuilder/" + vendor.phone);
    });
    // 
    $("#power").on('click', function () {
        $('#onlineLable').click();
    });
    $("#reportmenu").on('click', function () {
        $('#orderreport').off('click');
        $("#orderreport").on('click', function () {
            vm.myorders.loadClosed();
            $('#reportMenuPopup').popup("close");
            setTimeout(function() {
                $('#localorders').popup({ positionTo: "window", transition: "pop" });
                $('#localorders').popup("open");
            }, 1000);
        });
        $('#orderoptions').off('click');
        $("#orderoptions").on('click', function () {
            $('#reportMenuPopup').popup("close");
            setTimeout(function () {
                $('#voption').popup({ positionTo: "window", transition: "pop" });
                $('#voption').popup("open");
            }, 1000);

        });
        $('#btschedule').off('click');
        $("#btschedule").on('click', function() {
            $('#reportMenuPopup').popup("close");
            setTimeout(function () {
                $('#schedulePopUp').popup({ positionTo: "window", transition: "pop" });
                $('#schedulePopUp').popup("open");
            }, 1000);
            
        });
        $('#btcustomer').off('click');
        $("#btcustomer").on('click', function () {
            $('#reportMenuPopup').popup("close");
            vm.customers.load();
            setTimeout(function () {
                
                $('#customers').popup({ positionTo: "window", transition: "pop" });
                $('#customers').popup("open");
            }, 1000);
           
        });
    });
    $('#button').on('click', function () {
        $(this).toggleClass('on');
    });
    
  //  if (!allOrders) allOrders = []; else allOrders = jQuery.parseJSON(allOrders);
        socket.on("connect", function () {
            if (!connected) {
                vendor.sessionId = this.socket.sessionid;
                var eVendor = JSON.parse(JSON.stringify(vendor));
                eVendor.isOnline = vendor.isOnline();
                $("#vendorisOnline").attr('checked', eVendor.isOnline ).change();
               
                var customers = new Customers(vendor);
                var schedule = new Schedule(scheduleData);
                var myorders = new MyOrders(socket, vendor.sessionId, vendor,  customers);
                vm = { myorders: myorders, vendor: vendor, schedule: schedule, customers: customers };
                ko.applyBindings(vm);
                vm.myorders.updateStatus();
                connected = true;
                //   setInterval(function () { socket.emit('checkonline', rdata); }, 24000);
            } else {
                console.log("reconnected:" + new Date());
                vm.myorders.refreshOrders();
            }
        });
        socket.on('refreshorder', function (data) {
            if ((data.to == vendor.phone) && (data.sessionId != vendor.sessionId)) vm.myorders.refreshOrders();
        });
        socket.on('sendorder', function (data) {
            if (data.to == vendor.phone) vm.myorders.addorder(data);
        });
        socket.on('updatesession', function (data) {
            if (data.to == vendor.phone) vm.myorders.updateSession(data);
        });
        socket.on('checkonline', function (data) {
            var rdata = { "phone": vendor.phone, "isOnline": vendor.isOnline(), "sessionId": vendor.sessionId };
            if (data.phone == vendor.phone) socket.emit('isonline', rdata);
        });
        socket.on('isonline', function (data) {
            if (data.sessionId == vendor.sessionId) return;
            if (data.isOnline == vendor.isOnline()) return;
            if (data.phone == vendor.phone) {
                vendor.isOnline(data.isOnline);
                $("#vendorisOnline:checkbox").attr('checked', data.isOnline);
                if (data.isOnline) {
            $("#onlineLable").text("Online");
            $("#power").css("background-image", "url(/styles/poweron.png)");
            $.ionSound.play("Logon");
            //if (cgAudio) sndLogon.play();
        }
        else {
            vendor.isOnline(false);
            $("#onlineLable").text("Offline");
            $("#power").css("background-image", "url(/styles/poweroff.png)");
            $.ionSound.play("Logoff");
           // if (cgAudio) sndLogoff.play();
        }
            }
        });

 //   };

});

