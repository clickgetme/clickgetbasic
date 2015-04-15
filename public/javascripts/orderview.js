
var takeOrderLoaded = false;
var alarms = {};
var sessionId = "";
var vendorOnline;
var orderNumber;
var powercontrol = false;
var clockid = 0;
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
        $('#schedulePopUp').popup("close");
    };
}  
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


function login() {
    var userName = "";
    var  userPhone = "";
    var password = "";
    var required = "";
$('#loginDevices ul li').click(function(){
    var $a = $(this).find('a');
    $(this).parents('#loginDevices').children('li a').replaceWith($a)
});
    $('#lsubmit').off('click');
    $('#lsubmit').on('click', function() {
        required = "";
         userName = $("#usertype").val();
       // userPhone = $("#uphone").val();
        password = $("#lpassword").val();
       // if (userName == "") required += required ? ", user name" : "user name";
       // if (userPhone == "") required += required ? ", user phone" : "user phone";
        if (password == "") required += required ? ", Password" : "Password";
        if (!required) {
            var userlogin = { "vendorPhone": vendor.phone,  "password": password, "userName": userName };
            jQuery.ajax({
                type: "POST",
                data: userlogin,
                url: '/ulogin',
                success: function(result) {
                    if (result) {
                        $('#login').hide();
                        loggedin();
                        setTimeout(function () {
                            $('#ordertakerwrap').show();
                        }, 2500);
                    }
                    else $('#loginerror').text("Invalid User Name and password").show();
                },
                async: false
            });
        } else {
            $('#loginerror').text("required:" + required);
        };
    });
}
var connected = false;
function loggedin() {



    $.post("/users/isAdmin", { "vendorPhone": vendor.phone }, function () {
        var hashstring = "";
        if (window.location.hash) {
            hashstring = window.location.hash.substr(1);

        }
        if(hashstring =="") $('#adminmenu').show();
        powercontrol = true;
    });
    vendor.orderNumber = orderNumber;
    
   
    $.post('/vOpt', { "phone": vendor.phone }, function (vOpt) {
        vendor.vOpt = vOpt;
        vendor.options = {};
        for (var i = 0; i < vOpt.length; i++) {
            var key = Object.keys(vOpt[i])[0];
            var value = vOpt[i][Object.keys(vOpt[i])[0]];
            vendor.options[key] = value;
        };
    });
    var scheduleData = {};
    $.ajax({
        url: "/schedule/" + vendor.phone,
        type: "GET",
        async: false,
        dataType: 'json'
    }).done(function (data) {
        scheduleData = data.schedule;
    });
    var url = "/orderfrom/" + vendor.phone + "?fromiframe=true";
    $('#ifordertaker').attr("src", url);
    var iframe = document.getElementById('ifordertaker');
    iframe.src = iframe.src;
    var vm = {};
    var socket = io.connect();

    $("#custall").change(function () {
        $(".custs").prop('checked', $("#custall").is(':checked'));
    });
    $("#lb_power").click(function () {
        if (!powercontrol) return;
        var vOn = !($("#chk_power").attr('checked')=='checked');
        //alert(vOn);
        
        vendor.isOnline(vOn);
        $.post("/vendorOnline", { "phone": vendor.phone, "isOnline": vOn });
        var rdata = { "phone": vendor.phone, "isOnline": vOn, "sessionId": vendor.sessionId };
        socket.emit('isonline', rdata);
       // $.get("/vendorOnlineSet/" + vendor.phone + "/" + sessionId + "/" + vendor.isOnline());
    });

    $(".showviewoption").click(function () {
        $(this).toggleClass("viewselected");
    });
    $("#vendorisOnline:checkbox").change(function () {
        var vOn = $("#vendorisOnline:checkbox").is(':checked');
        console.log("checkbox change");
        vendor.isOnline(vOn);
        // $.ionSound.play(vOn ? " Logon" : "Logoff");
        $("#chk_power").attr('checked', vOn);
        $('#lb_power span').css('color', vOn ? "#9ACD32" : " red");
        $('#vonlinestat').css('color', vOn ? "#9ACD32" : " red").text(vOn ? " Online" : "Offline");
        //$.get("/vendorOnlineSet/" + vendor.phone + "/" + sessionId + "/" + vOn);
        //$.post("/vendorOnline", { "phone": vendor.phone, "isOnline": vendor.isOnline() });
    });
    $("#takeorder").on('click', function () {
        //if (!vendor.isOnline()) {
        //    alert("Go Online");
        //    return;
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
   // binditem();
    $('#btusers').off('click');
    $("#btusers").on('click', function () {
        vm.users.getUsers();
        $('#usersdlg').popup({
            positionTo: "window", transition: "pop", afteropen: function (event, ui) {
                $('#btAdduser').off('click');
                $("#btAdduser").on('click', function () {
                    vm.users.addNewUser();
                });
                $('.removeuser').off('click');
                $(".removeuser").on('click', function () {
                    var self = this;
                    var userid = $(self).attr('userid');
                    vm.users.removeUser(userid);
                });
                $('.saveuser').off('click');
                $(".saveuser").on('click', function () {
                    var self = this;
                    var userid = $(self).attr('userid');
                    var password = $("#" + userid).val();
                    vm.users.saveUser(userid, password);
                });
            }
        });
        $('#usersdlg').popup("open");
    });
   
    $('#bthistory').off('click');
    $("#bthistory").on('click', function () {
        vm.myorders.loadClosed();  
        $('#localorders').popup({ positionTo: "window", transition: "pop" });
        $('#localorders').popup("open");
    });

    //btaccount

    $('#btoption').off('click');
    $("#btoption").on('click', function () {
            $('#voption').popup({ positionTo: "window", transition: "pop" });
            $('#voption').popup("open");
    });
    $('#btaccount').off('click');
    $("#btaccount").on('click', function () {
        $('#account').popup({ positionTo: "window", transition: "pop" });
        $('#account').popup("open");
        });
        
    $('#btschedule').off('click');
    $("#btschedule").on('click', function () {
            $('#schedulePopUp').popup({ positionTo: "window", transition: "pop" });
            $('#schedulePopUp').popup("open");
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

    vendor.isOnline = function (vOn) {
        if (vOn != "undefined") {
            vendorOnline = vOn;
            if (vOn) {
                $("#chk_power").attr('checked', 'checked');
                $.ionSound.play("Logon");
                $('#vonlinestat').css('color', "#9ACD32").text("Online");
                $("#lb_power span").css('color', "#9ACD32");
            } else {
                $("#chk_power").removeAttr('checked');
                $.ionSound.play("Logoff");
                $('#lb_power span').css('color', '#000000');
                $('#vonlinestat').css('color', "red").text("Offline");
                $("#lb_power span").css('color', "#000000");
            }
        }
        document.getElementById('ifordertaker').src = document.getElementById('ifordertaker').src;
        return vendorOnline;
    };

    socket.on("connect", function () {
        $.ajax({
            url: "/vendorOnline/" + vendor.phone,
            type: "GET",
            async: false,
            dataType: 'json'
        }).done(function (data) {
            vendor.isOnline(data.isOnline);
        });
        $(window).onbeforeunload = function() {
        socket.emit('clearvendor', { "phone": vendor.phone, "sessionId": sessionId });
    };	
        if (!connected) {
            sessionId = this.socket.sessionid;
            vendor.sessionId = sessionId;
            
            
            socket.emit('setvendor', { "phone": vendor.phone, "sessionId": sessionId });
            socket.emit('vPing', { "phone": vendor.phone, "sessionId": sessionId });
            
            var order = new Order(socket, sessionId, vendor);
           // var mylocation = new MyLocation();
            var customers = new Customers(vendor);
            var schedule = new Schedule(scheduleData);
            var myorders = new MyOrders(socket, sessionId, vendor, powercontrol);
            var users = new Users(vendor);
            vm = { myorders: myorders, vendor: vendor, schedule: schedule, customers: customers, users: users };
            //   vm = { cart: cart, dcombo: dcombo, order: order, vendor: new Vendor(vendor), register: register, vuser: vuser, mylocation: mylocation };
            ko.applyBindings(vm);
            clockid = setInterval('updateClock()', 1000);
            connected = true;
            //   setInterval(function () { socket.emit('checkonline', rdata); }, 24000);
        } else {
            console.log("reconnected:" + new Date());
            socket.emit('setvendor', { "phone": vendor.phone, "sessionId": sessionId });
            vm.myorders.refreshOrders();
        }
    });
    socket.on('isonline', function (data) {
        if (data.sessionId == sessionId) return;
        
        var vOn = data.isOnline;
        if (data.isOnline == vendor.isOnline()) return;
        if (data.phone == vendor.phone) {
            vendor.isOnline(vOn);
        }
    });
    socket.on('vPingBack', function () {
        setTimeout(function () {
            socket.emit('vPing', { "phone": vendor.phone, "sessionId": sessionId });
            socket.emit('custconnect', { "phone": vendor.phone });
        }, 24000);

    });
   // socket.emit('ping', { "phone": vendor.phone, "sessionId": sessionId });
    //custcount
    socket.on('customers', function (data) {


        //var cust = JSON.parse(data);
        //var ccount = data.customers.length;
        vm.myorders.liveCustomers(data.customers);
        //$("customercount").html(ccount.toString());
    });
    socket.on('remote', function (data) {
        if (data.sessionId == sessionId) return;
        if (data.vendorPhone == vendor.phone) {
            var orderId = data.orderId;
            switch (data.status) {
                case "received":
                    break;
                case "ready":
                    vm.myorders.remoteReady(orderId);
                    break;
                case "Delivering":
                    vm.myorders.remoteDeliver(orderId);
                    break;
                case "processing":
                    vm.myorders.remoteProcess(orderId);
                    break;
                case "closed":
                    vm.myorders.remoteClose(orderId);
                    break;
                case "delivered":
                    vm.myorders.remoteDeliver(orderId);
                    break;
                default:

                    break;
            };
        }
    });
    socket.on('refreshorder', function (data) {
        if ((data.to == vendor.phone) && (data.sessionId != vendor.sessionId)) vm.myorders.refreshOrders();
    });
    //socket.on('sendorder', function (data) {
    //    if (data.to == vendor.phone) vm.myorders.addorder(data);
    //});
    socket.on('updatesession', function (data) {
        if (data.to == vendor.phone) vm.myorders.updateSession(data);
    });
    socket.on('checkonline', function (data) {
        if (!powercontrol) return;
        var check = vendor.isOnline() ? true : false;
        var rdata = { "phone": vendor.phone, "isOnline": check, "sessionId": vendor.sessionId };
        if (data.phone == vendor.phone) socket.emit('isonline', rdata);
    });

    $("#ordertakerwrap").removeClass("othide");
};


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
        multiPlay: true,               // playing only 1 sound at once
        volume: "1.0"                   // not so loud please
    });


    //  login
    $.get('/users/authenticated/' + vendor.phone)
    .done(function () {

        loggedin();
        $('#login').hide();
        setTimeout(function () {
            $('#ordertakerwrap').show();
        }, 1500);
    })
    .fail(function () {
        $('#login').show();
        $('#vendorName').html(vendor.name);
         $('#vendorPhone').html(formatPhone(vendor.phone));
        login();
    });
    
    
});

