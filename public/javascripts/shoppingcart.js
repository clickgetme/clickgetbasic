function shOrder(order) {
    var self = this;
    var localsavedOrders = amplify.store('savedOrders');
    self.id = ko.observable(order.id);
    self.number = ko.observable(order.number);
    self.pickuptime = ko.observable(order.pickuptime);
    self.orderphone = ko.observable(order.orderphone);
    self.ordername = ko.observable(order.ordername);
    self.ordermail = ko.observable(order.ordermail);
    self.date = ko.observable(order.date);
    self.total = ko.observable(order.total);
    self.status = ko.observable(order.status);
    self.message = ko.observable(order.message);
    self.dinetype = ko.observable(order.dinetype);
    self.deliveryLocation = ko.observable(order.deliveryLocation);
    self.from = ko.observable(order.from);
    self.time = ko.observable(order.time);
    self.orderLines = ko.observableArray(order.orderLines);
    self.ready = ko.observable(true);
    self.process = ko.observable(true);
    self.close = ko.observable(true);
    self.external = ko.observable();
    self.user = order.user;
};

function Cart(socket, sessionId, vendor, user, vuser, pending, showStatus) {
    var self = this;
    self.vendor = vendor;
    self.pending = pending;
    self.lines = ko.observableArray();
    self.user = user;
    self.itemsValue = 0;
    self.itemsCount = 0;
    self.cartCount = ko.observable(0);
    self.offlineOrder = {};
    self.guestName = ko.observable("");
    self.guestPhone = ko.observable("");
    self.pickupTime = ko.observable("");
    self.dinetype = ko.observable("Take Out");
    self.takeOut = ko.observable({ "name": "Take Out", "enabled": false });
    self.eatIn = ko.observable({ "name": "Eat in", "enabled": false });
    self.delivery = ko.observable({ "name": "Delivery", "enabled": false });
    self.picktimecontrol = ko.observable({ "title": "Pick-up time", "show": true });
    self.picktimetoggle = function() {
        if (self.picktimecontrol().show) {
            self.picktimecontrol({ "title": "Set Pick-up time", "show": false });
        } else {
            self.picktimecontrol({ "title": "Pick-up time", "show": true });
            var date = new Date().getTime() + 5 * 60000;
            self.pickupTime(new Date(date).toTimeString().split(' ')[0]);
            $('#pickuptime').focus();
        }
    };
    for (var d = 0; d < self.vendor.dinetypes.length; d++) {
        var dt = vendor.dinetypes[d];
        if (dt.type == "takeout") {
            self.takeOut().name = dt.name;
            self.takeOut().enabled = true;
        };
        if (dt.type == "eatin") {
            self.eatIn().name = dt.name;
            self.eatIn().enabled = true;
        };
        if (dt.type == "delivery") {
            self.delivery().name = dt.name;
            self.delivery().enabled = true;
        };
    };
    if (self.vendor.dinetypes.length == 1) {
        self.dinetype(vendor.dinetypes[0].name);
        $("#gsdinetype").hide();
    };
    self.dinetypes = ko.observableArray();
    self.total = ko.observable(formatCurrency(0));
    self.socket = socket;
    self.wasme = !showStatus;
    self.sessionId = sessionId;
    self.offlineOrder = vendor.options['offlineOrder'];
    self.sendOk = ko.observable(false);
    self.addLine = function (line) {
        //console.log(line);
        if (line) {
            self.lines.push(line);
        };
        self.sendOk(true);
        var count = self.itemsCount;
        var total = parseFloat(self.itemsValue);
        count += parseInt(line.quantity);
        self.itemsCount = count;
        self.cartCount(count);
        total += parseFloat(line.subtotal);
        self.itemsValue = total;
        self.total(formatCurrency(total));
        $("#shoppingchart").show();
    };
    self.concatLine = function (nlines) {
        //console.log(line);
        if (nlines) {
            //alert(nlines.length);
            for (var i=0; i<nlines.length; i++) {
               
                self.addLine(nlines[i]);
                }
            };
    };
    var savedOrders = {};
    var localsavedOrders = amplify.store('savedOrders');
    self.removeLine = function () {
        var count = self.itemsCount;
        var total = self.itemsValue;
        count -= parseInt(this.quantity);
        self.itemsCount = count;
        if (count) self.sendOk(true);
        else {
            self.sendOk(false);
            $('#shoppingdetails').popup("close");
        }
        self.cartCount(count);
        total = total - parseFloat(this.subtotal);
        self.itemsValue = total;
        self.total(formatCurrency(total));
        self.lines.remove(this);
         $.ionSound.play("recycle");

    };
    self.clearLines = function () {
        self.lines.length = 0;
        self.lines.removeAll();
        self.itemsCount = 0;
        self.itemsValue = 0;
        self.cartCount(0);
        self.total(formatCurrency(0));
        self.sendOk(false);
        if (localsavedOrders) savedOrders = JSON.parse(localsavedOrders);
    if (typeof savedOrders[vendor.phone] != "undefined") {
        delete savedOrders[vendor.phone].order;
        amplify.store('savedOrders', JSON.stringify(savedOrders));
    }
     
    };
    self.guestsigninopen = function () {
        $('#guestsignin').popup({
            positionTo: "window", overlayTheme: "b", theme: "b", dismissible: false, transition: "pop", afteropen: function (event, ui) {
                if (focus && $("#guestname").val().length < 1) $('#guestname').focus();
               
            }
        });
        $('#guestsignin').popup("open");
    };
    self.sendGuest = function () {
        var order = {
            number: "",
            to: vendor.phone,
            ordername: $("#guestname").val(),
            date: datenow(),
            pickuptime: self.picktimecontrol().show ? tConvert(self.pickupTime()) : "",
            orderphone: $("#guestphone").val().replace(/[^0-9]/g, ''),
            orderemail: self.user.email,
            total: self.total(),
            message: "",
            status: "sent",
            external: !self.wasme,
            from: self.sessionId,
            time: timenow(),
            orderLines: jQuery.parseJSON(ko.toJSON(self.lines))
        };
       // if (!self.vendor.isOnline) if (!showStatus) self.vendor.isOnline = true;
             
        /// offline ordering text confermation required at additional cost
        if (self.vendor.isOnline) {
            if (!self.sendOk()) return;
            var phone = $("#guestphone").val();
            var phoneRequired = !self.wasme;
            if (self.dinetype() == "Delivery") phoneRequired = true;
            phone = phone.replace(/[^0-9]/g, '');
            if (phoneRequired && (phone.length != 10)) {
                $('#guestphone').focus();
                $('#guestphone').css("background-color", "orange");
                return;
            };
            if ($("#guestname").val()=="") {
                $('#guestname').focus();
                $('#guestname').css("background-color", "orange");
                return;
            };
            amplify.store('guser', { "name": $("#guestname").val(), "phone": phone }, null);
            vuser.name($("#guestname").val());
            
            $('#guestsignin').popup("close");
            if (self.wasme) 
                vm.mylocation.mode("input");
                
            var postOrder = function () {
                setTimeout(function () {
                    order.dinetype = self.dinetype();
                  //  if (order.dinetype == "Delivery") order.deliveryLocation = self.deliveryLocation();
                if (self.wasme) {
                    self.user.name = "me";
                    
                }
                self.sendOk(false);
                jQuery.ajax({
                    type: "POST",
                    data: { "vendorPhone": vendor.phone, "order": order },
                    url: '/submitOrder',
                    success: function(result) {
                        order.id = result.orderId;
                        order.number = result.orderNumber;
                        self.pending.order = order;
                        self.pending.save();
                        self.socket.emit('sendorder', order);
                    },
                    async: false
                });
                }, 500);
            };
            if (self.dinetype() =="Delivery") {
            setTimeout(function (){
            vm.mylocation.popup(function (canceled) {
                    if (canceled) {
                        setTimeout(self.guestsigninopen(), 500);
                    }
                },
                function(complete) {
                    order.deliveryLocation = complete;
                    postOrder();
                });
            }, 1000);
            } else postOrder();
        } else {
            var answer = confirm("Vendor is Not online Save data?");
            if (answer) {
                if (localsavedOrders) savedOrders = JSON.parse(localsavedOrders);
                if (typeof savedOrders[vendor.phone] == "undefined") {
                    savedOrders[vendor.phone] = { "orders": {} };
                };
                savedOrders[vendor.phone].orders[data.id] = order;

                amplify.store('savedOrders', JSON.stringify(savedOrders));
            }
            else {
                //some code
            }
            
        }
    };
    self.sendOrder = function () {
        var order = {
                number: "", to: vendor.phone, ordername: self.user.name, date: datenow(),
                orderphone: self.user.phone, orderemail: self.user.email,
                total: self.total(), status: "sent", from: self.sessionId,
                user: self.user, external: self.wasme,
                time: timenow(), orderLines: jQuery.parseJSON(ko.toJSON(self.lines))
            };
        if (!self.sendOk()) return;
        if (self.vendor.isOnline) {
            if (order.orderLines.length) {
                if (self.user.name == "me") {
                    self.wasme = true;
                    amplify.store('guser', {"name": "" , "phone": ""}, null);
                    self.user.name = "guest";
                }
                if (self.user.name != "guest") {
                    self.socket.emit('sendorder', order);
                    //self.clearLines();
                }
                else {
                    vm.order.status('Submiting');
                    $('#gscancel').off('click');
                    $('#gscancel').on('click', function () {
                        vm.order.status('');
                        $('#guestsignin').popup("close");
                    });
                    var guser = amplify.store('guser');
                    var focus = true;
                    if (guser) { 
                        $("#guestname").val(guser.name);
                        $("#guestphone").val(guser.phone);
                       if ($("#guestname").val() != "")  focus = false;
                    };
                    var date = new Date().getTime() + 5 * 60000;
                    self.pickupTime(new Date(date).toTimeString().split(' ')[0]);
                    if (!self.picktimecontrol().show) self.pickupTime("");
                    self.guestsigninopen();
                    order.dinetype = self.dinetype();
                    $('.dineopt').off('click');
                    $('.dineopt').on('click', function () {
                        $('.dineopt').css("color", "black");
                        $(this).css("color", "#fef79a");
                        var dinetype = $(this).text();
                        var color = $(this).css("color");
                        if(dinetype=="Delivery")
                            $('#gsok').text("Next"); else $('#gsok').text("OK");
                        self.dinetype(dinetype);
                        order.dinetype = self.dinetype();
                        

                    });
                };
            };
        } else if (self.offlineOrder) {
            $('#offlinesignin').popup({
                positionTo: "window", overlayTheme: "b", theme: "b", dismissible: true, transition: "pop", afteropen: function (event, ui) {
                    $('#offlinename').focus();
                }
            });
            $('#offlinesignin').popup("open");
            
        } else {
            var answer = confirm("Vendor is Not online Save data?");
            if (answer) {
                if (localsavedOrders) savedOrders = JSON.parse(localsavedOrders);
                if (typeof savedOrders[vendor.phone] == "undefined") {
                    savedOrders[vendor.phone] = { "order": {} };
                };
                savedOrders[vendor.phone].order = order;

                amplify.store('savedOrders', JSON.stringify(savedOrders));
            }
            else {
                //some code
            }
        }
    };
    self.sendoffline = function () {
        if ($("#offlinename").val() != "" && $("#offlinephone").val() != "") {
            amplify.store('offuser', { "name": $("#offlinename").val(), "phone": $("#offlinephone").val() }, null);
            var order = {
                number: "", to: vendor.phone, ordername: $("#offlinename").val(), date: datenow(),
                pickuptime: $("#pickupdatetime").val(),
                orderphone: $("#offlinephone").val(), orderemail: self.user.email,
                total: self.total(), status: "sent", from: self.sessionId,
                time: timenow(), orderLines: jQuery.parseJSON(ko.toJSON(self.lines))
            };
            $('#offlinesignin').popup("close");
            $.post('/offlineorder', { "phone": vendor.phone, "order": order }, function (data) {
                // handel error
                vm.order.lines(data.orderLines);
                vm.order.name(data.ordername);
                vm.order.status('sending offline');
                vm.order.total(data.total);
                vm.order.date(data.date);
                vm.order.id = data.id;
                order.id = data.id;
                var offlineOrder = {};
                var localoffline = amplify.store('offlineOrder');
                if (localoffline) offlineOrder = JSON.parse(localoffline);
                if (typeof offlineOrder[vendor.phone] == "undefined") {
                    offlineOrder[vendor.phone] = { "orders": {} };
                };
                offlineOrder[vendor.phone].orders[data.id] = order;

                amplify.store('offlineOrder', JSON.stringify(offlineOrder));
                var orderId = data.id;
                $('#offlineOrderDialog').popup({ positionTo: "window", overlayTheme: "b", theme: "b", dismissible: false, transition: "pop" });
                $('#offlineOrderDialog').popup("open");
              
                $('#btofflineCancel').click(function () {
                    $.get('/offLineCancel/' + vendor.phone + "/" + orderId);
                    delete offlineOrder[vendor.phone].orders[orderId];
                    amplify.store('offlineOrder', JSON.stringify(offlineOrder));
                    $('#offlineOrderDialog').popup("close");
                });
                $('#btofflineclose').click(function () {
                    self.clearLines();
                    $('#offlineOrderDialog').popup("close");
                });
            });
        };
    };
    self.offlineOrders = ko.observableArray();
    if (localsavedOrders) savedOrders = JSON.parse(localsavedOrders);
    if (typeof savedOrders[vendor.phone] == "undefined") {
        savedOrders[vendor.phone] = { "order": {"orderLines" : []} };
    };
    if (typeof savedOrders[vendor.phone].order != "undefined") {
        var sorder = savedOrders[vendor.phone].order;
        for (var l = 0; l < sorder.orderLines.length; l++) {
            self.addLine(sorder.orderLines[l]);
        }
    }
    if (!self.wasme) {
        self.pending.load();
        if (typeof self.pending.order.orderLines != "undefined") {
            self.pending.status = true;
            jQuery.ajax({
                type: "POST",
                data: { "vendorPhone": vendor.phone, "orderId": self.pending.order.id, "session": sessionId },
                url: '/updateOrderSession',
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //  alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText);
                    self.pending.clear();
                },
                success: function(result) {
                    if (!result.found) {
                        self.pending.clear();
                        return;
                    }
                    
                    if (result.sessionChanged) {
                        self.pending.order.from = sessionId;
                        self.pending.order.sessionId = sessionId;
                         setTimeout(function () {
                            vm.order.orderto = vendor.phone;
                            vm.order.from(self.pending.order.from);
                            vm.order.number(self.pending.order.number);
                            vm.order.name(self.pending.order.name);
                            vm.order.dinetype(self.pending.order.dinetype);
                            vm.order.deliveryLocation(self.pending.order.deliveryLocation);
                            vm.order.date(self.pending.order.date);
                            vm.order.lines(self.pending.order.orderLines);
                            vm.order.status(self.pending.order.status);
                            vm.order.message(self.pending.order.message);
                            vm.order.total(self.pending.order.total);
                            //vm.order.external(self.pending.order.external);
                            
                            self.socket.emit('updatesession', self.pending.order);
                            self.pending.clock();
                             
                        }, 500);
                    }
                },
                async: false
            });
        }
    }
}