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
    self.user = order.user;
};
function Cart(socket, sessionId, vendor) {
    var self = this;
    self.vendor = vendor;
    self.lines = ko.observableArray();
    self.itemsValue = 0;
    self.itemsCount = 0;
    self.cartCount = ko.observable(0);
    self.guestName = ko.observable("");
    self.guestPhone = ko.observable("");
    self.pickupTime = ko.observable("");
    self.dinetype = ko.observable("Take Out");
    self.takeOut = ko.observable({ "name": "Take Out", "enabled": false; });
    self.eatIn = ko.observable({ "name": "Eat in", "enabled": false; });
    self.delivery = ko.observable({ "name": "Delivery", "enabled": false; });
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
    self.sessionId = sessionId;
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
            for (var i = 0; i < nlines.length; i++) {

                self.addLine(nlines[i]);
            }
        };
    };
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
            pickuptime: tConvert(self.pickupTime()),
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
            if ($("#guestname").val() == "") {
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
                        success: function (result) {
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
           
        } 
    };
    self.sendOrder = function () {
        var order = {
            number: "", to: vendor.phone, ordername: self.user.name, date: datenow(),
            orderphone: self.user.phone, orderemail: self.user.email,
            total: self.total(), status: "sent", from: self.sessionId,
            user: self.user,
            time: timenow(), orderLines: jQuery.parseJSON(ko.toJSON(self.lines))
        };
        if (!self.sendOk()) return;
        if (self.vendor.isOnline) {
            if (order.orderLines.length) {
                
               
                    self.socket.emit('sendorder', order);
                    //self.clearLines();
             

                    order.dinetype = self.dinetype();
                    $('.dineopt').off('click');
                    $('.dineopt').on('click', function () {
                        $('.dineopt').css("color", "black");
                        $(this).css("color", "#fef79a");
                        var dinetype = $(this).text();
                        var color = $(this).css("color");
                        //$('#gsok').css("color", color);
                        self.dinetype(dinetype);
                        order.dinetype = self.dinetype();


                    });
                };
            };
       };

}