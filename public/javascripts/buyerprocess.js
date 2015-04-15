
var clockid = 0;
var syncid =0;
var vendorItems = [];
var menus;
var currentOrderStatus = "";
var pending = { "order": {}, "status": false };
idleTimer = null;
idleState = false;
idleWait = 18000000;
idleOff = false;

function compIsType(t, s) {
    for (var z = 0; z < t.length; ++z)
        if (t[z] == s)
            return true;
    return false;
}
function is_int(value) {
    if ((parseFloat(value) == parseInt(value)) && !isNaN(value)) {
        return true;
    } else {
        return false;
    }
}
function checkRegistered() {
    var registered = false;
    var vendors = {};
    var lvendors = amplify.store('vendors');
    if (lvendors) vendors = lvendors;
    if (typeof vendors[vendor.phone] != 'undefined') registered = true;
    return registered;
}
var phoneRegistered = checkRegistered();
pending.save = function () {
    var pending = {};
    var lpending = amplify.store('pending');

    if (lpending) pending = lpending;
    if (typeof pending[vendor.phone] == 'undefined') pending[vendor.phone] = {};
    pending[vendor.phone] = this.order;
    amplify.store("pending",null);
    amplify.store('pending', pending);

};
pending.load = function () {
    var pending = {};
    var lpending = amplify.store('pending');

    if (lpending) pending = lpending;
    if (typeof pending[vendor.phone] == 'undefined') pending[vendor.phone] = {};
    this.order = pending[vendor.phone];

};
pending.clear = function () {
    var pending = {};
    var lpending = amplify.store('pending');
    if (lpending) pending = lpending;
    if (typeof pending[vendor.phone] != 'undefined') pending[vendor.phone] = { "order": {}, "status": false };
    amplify.store("pending",null);
    amplify.store('pending', pending);
};
pending.clock = function() {
    updateClock();
    clockid = setInterval('updateClock()', 1000);
};

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
function BuildMenu(data) {
    menus = jQuery.parseJSON(data);

    var menushtml = new StringBuilder();
	menushtml.append('<div id="menuwrap">');
    if(getUrlVars()["fromiframe"] != "true") {
        menushtml.append('<div id="upcontrol" class="topframe"><div id="titlebar" class="titlebar"><a href="#popupAddress" id="vendortag"><span class="vendorname" data-bind="text:vendor.name"></span></a>' +
                     '<div class="phonediv"><label><i class="fa fa-phone-square"></i> &nbsp; phone</label><a href="tel:' + vendor.phone + '" ><span  class="vendorphone" data-bind="text:formatPhone(vendor.phone())"></span></a></div><span id="vendorstatus" data-bind="text: vendor.status"></span></div>');
    };
   
    menushtml.append('<div class="itemsSearch"><input type="search" id="autocomplete" placeholder="Menu Item Search"></div></div>');
    for (var m = 0; m < menus.length; m++) {
        var menu = menus[m];
        var groups = menu.groups;
        var menuhtml = new StringBuilder();
        var itemhtml = new StringBuilder();
        //
        //html.append('<h6> menu: click &dArr; to select items </h6>');
        menuhtml.append('<div data-role="collapsible-set" class="menu" menuId=' + menu.menuId + '>');
        for (var g = 0; g < groups.length; g++) {
            var group = groups[g];
            var items = group.groupItems;
            var groupId = group.groupId;
            var tabshtml = new StringBuilder();
            tabshtml.append('<div id="group' + groupId + '" class="cggroup section-header group-header" data-role="collapsible" data-collapsed-icon="arrow-d" >');
            tabshtml.append('<h4>');
            tabshtml.append('<span>' + group.groupName + '</span>');
           
            tabshtml.append('</h4>');
            tabshtml.append('<div class="p control-group groupdiv">');
            tabshtml.append('<div class="groupdiscription">' + group.groupDescription + '</div>');
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (typeof item.includes=="undefined") item.includes=[];
                if (typeof item.selects=="undefined") item.selects=[];
                vendorItems.push({ "value": item.itemName + " " + item.itemDescription, "lable": item.itemName + " " + item.itemDescription, "menuId": item.menuId, "groupId": item.groupId, "itemId": item.itemId });
                var itemName = item.itemName;
                var itemDescription = item.itemDescription;
                var sizes = item.itemSizes;
                var hideItem = "";
                if (!item.showItem) hideItem = " hideitem ";
                var prices = "";
                for (var sz = 0; sz < sizes.length; sz++) {
                    var size = sizes[sz];
                    if (!size.sizeEnabled) hideItem = " hideitem ";
                    prices += '<div menuId=' + item.menuId + ' groupId=' + item.groupId + ' itemId=' + item.itemId + '  class="size' + hideItem + '"><span class="sizename">' + sizes[sz].sizeName + '</span><span class="sizeprice" >' + sizes[sz].sizePrice + '</span></div>';
                };
                itemhtml.clear();
                itemhtml.append('<div menuId=' + item.menuId + ' groupId=' + item.groupId + ' itemId=' + item.itemId + ' class="ui-btn ui-btn-inline ui-corner-all item itembutton' + hideItem + '" ');
                // attribute
                itemhtml.append('itemName ="' + itemName + '" ');
                itemhtml.append('>');
                itemhtml.append('<div  class ="itn">' + itemName + '</div>');
                itemhtml.append('<div  class ="itd">' + itemDescription + '</div>');
                itemhtml.append('<div class ="itp">' + prices + '</div>');
                itemhtml.append('</div>');
                tabshtml.append(itemhtml.toString());
            };
            tabshtml.append('</div></div>');
            menuhtml.append(tabshtml.toString());
            //console.log(tabshtml.toString());
        };
 
        menuhtml.append('</div></div><div id="menubottom"></div>'); // close menu
        
        menushtml.append(menuhtml.toString());
        // menushtml.append('<div data-role="popup" id="popupAddress"><p>' + vendor.location.address + '</p><p>' + vendor.location.city + ', ' + vendor.location.state + '  ' + vendor.location.zip + '</p></div>');
    }
	
	// close menuwrap
    $('#menus').html(menushtml.toString() + '<br class="clear" /></div>');
    $('#menus').trigger('create');
    
};
function thankyou(v) {
    $('#thankyou').popup({ positionTo: "window", overlayTheme: "b", theme: "b", dismissible: false, transition: "pop" });
    $('#thankyou').popup("open");
    if (v == "stay") return;
     $.ionSound.play("CGM Welcome");
    setTimeout("clickgetme()", 10000);
}

function clickgetme() {
    window.location = "http://clickget.me";

}

function registerPhone() {
    
    $('#guestregister').popup({
        positionTo: "window", overlayTheme: "b", theme: "b", dismissible: false, transition: "pop", afteropen: function (event, ui) {
            var guser = amplify.store('guser');
            if (guser) {
                $("#regname").val(guser.name);
                $("#regphone").val(guser.phone);
            };
            //$("input.phone").mask("(999) 999-9999");
            $('#regok').on('click', function () {
                var phone = $("#regphone").val();
                phone = phone.replace(/[^0-9]/g, '');
                if ((phone.length != 10)) {
                    $('#regphone').focus();
                    $('#regphone').css("background-color", "orange");
                    return;
                };
                if ($("#regname").val()=="") {
                    $('#regname').focus();
                    $('#regname').css("background-color", "orange");
                    return;
                };
                amplify.store('guser', { "name": $("#regname").val(), "phone": phone }, null);
                var vendors = {};
                var lvendors = amplify.store('vendors');
                if (lvendors) vendors = lvendors;
                if (typeof vendors[vendor.phone] == 'undefined') vendors[vendor.phone] = { "name": vendor.name, "phone": vendor.phone, "lastorder": {}, favorder: {} };
                amplify.store('vendors', vendors);
                phoneRegistered = true;
                $('#guestregister').popup("close");

            });
            $('#regcancel').on('click', function () { $('#guestregister').popup("close"); phoneRegistered = true; });
        } });
        $('#guestregister').popup("open");
        
    
}
$.post('/vOpt', { "phone": vendor.phone }, function(vOpt) {
    vendor.options = {}; 
   for (var i = 0; i < vOpt.length; i++) {
     
     var key = Object.keys( vOpt[i])[0];
     var value = vOpt[i][Object.keys(vOpt[i])[0]];
    vendor.options[key] =value;
    };
});
$.get('/menus/' + vendor.phone, function (data) { BuildMenu(data); });

// $('#options').load("/options/" + vendor.phone);
// Location

function MyLocation() {
    var self = this;
    self.locations = ko.observableArray();
    self.slocation = {};
    self.name = ko.observable("");
    self.address = ko.observable("");
    self.address2 = ko.observable("");
    self.city = ko.observable("");
    self.state = ko.observable("");
    self.zip = ko.observable("");
    self.note = ko.observable("");
    self.mode = ko.observable("");
    self.title = ko.observable("");
    self.error = ko.observable("");
    self.show = ko.observable(false);
    self.cancelcallback = {};
    self.completecallback = {};
    self.getCityState = function (results) {
        var a = results[0].address_components;
        var city, state;
        for (i = 0; i < a.length; ++i) {
            var t = a[i].types;
            if (compIsType(t, 'administrative_area_level_1'))
                state = a[i].short_name; //store the state
            else if (compIsType(t, 'locality'))
                city = a[i].long_name; //store the city
        }
        self.city(city);
        self.state(state);

        return;
    };
    self.popup = function (canceled, completed) {
        var ziplook = false;
        if (self.locations().length == 0) {
            self.newLocation();
            ziplook = true;

        }
        if (self.mode() == "input") self.inputLocation();
        self.newLocation = function () {
            self.name("");
            self.address("");
            self.address2("");
            self.city("");
            self.state("");
            self.zip("");
            self.note("");
            self.mode("new");
            self.title("New location");
            self.show(true);
            self.zipLookup(true);
        };
        $('#locationpop').popup({
            positionTo: "window", overlayTheme: "b", theme: "b", dismissible: false, transition: "pop", afteropen: function (event, ui) {
                self.zipLookup(ziplook);
            }
        });
        $('#locationpop').popup("open");

        self.cancelcallback = canceled;
        self.completecallback = completed;
    };
    self.save = function () {
        var locations = {};
        var llocations = amplify.store('locations');

        if (llocations) locations = JSON.parse(llocations);
        if (typeof locations[vendor.phone] == 'undefined') locations[vendor.phone] = new Array();
        locations[vendor.phone] = self.locations();
        amplify.store('locations', JSON.stringify(locations));

    };
    self.load = function () {
        var locations = {};
        var locationsArray = new Array();
        var llocations = amplify.store('locations');
        if (llocations) locations = JSON.parse(llocations);
        if (typeof locations[vendor.phone] != 'undefined') locationsArray = locations[vendor.phone];
        self.locations.removeAll();
        for (var i = 0; i < locationsArray.length; i++) {
            self.locations.push(locationsArray[i]);
        }
    };
    self.load();
    self.location = function() {
        var location = {
            "name": self.name(),
            "address": self.address(),
            "address2": self.address2(),
            "city": self.city(),
            "state": self.state(),
            "zip": self.zip(),
            "note": self.note()
        };
        return location;
    };
    self.validate = function (location) {
        var errorList = "";
        if (!location.name) {
            if (errorList) errorList += ", ";
            errorList += "Location Name";
        };
        if (!location.address) {
            if (errorList) errorList += ", ";
            errorList += "Address";
        };
        if (!location.city) {
            if (errorList) errorList += ", ";
            errorList += "City";
        };
        if (!location.state) {
            if (errorList) errorList += ", ";
            errorList += "State";
        };
        if (!location.zip) {
            if (errorList) errorList += ", ";
            errorList += "Zip";
        };
        if (errorList) {
            self.error(errorList + " Required!");
            $('#lerror').show();
            return false;
        }
        $('#lerror').hide();
        return true;
    };
    self.addLocation = function () {
        var location = self.location();
        if (self.validate(location)) {
            self.locations.push(location);
            self.mode("set");
            self.title("Selected Location");
            self.mode("set");
            self.save();
        }
    };
    self.cancelLocation = function () {
        if (self.mode() == "new" || self.mode() == "edit") {
            // $('#locationpop').popup("close");
            self.show(false);
            self.mode("");
            return;
        }
        if (self.mode() == "set" || self.mode() == "" || self.mode() == "input") {
            $('#locationpop').popup("close");
            setTimeout(function () {
                self.cancelcallback(true);
                return;
            }, 500);
        }
    };
    self.complete = function () {
        var location = self.location();
        if (self.validate(location)) {
            $('#locationpop').popup("close");
            var cb = JSON.parse(JSON.stringify(self.location()));
            self.completecallback(cb);
            return;
        }
    };
    // self.cancelcallback = {};
    //self.completecallback = {};
    self.setLocation = function () {
        self.slocation = this;
        self.name(this.name);
        self.address(this.address);
        self.address2(this.address2);
        self.city(this.city);
        self.state(this.state);
        self.zip(this.zip);
        self.note(this.note);
        self.show(true);
        self.title("Selected Location");
        self.zipLookup(false);
        self.mode("set");
        window.scrollTo(0, document.body.scrollHeight);
        $(".linput").change(function () {
            if (self.mode() == "update") return;
            if (self.mode() == "new") return;
            self.mode("update");
            self.title("Update Location");
        });

    };
    self.updateLocation = function () {

        self.slocation.name = self.name();
        self.slocation.address = self.address();
        self.slocation.address2 = self.address2();
        self.slocation.city = self.city();
        self.slocation.state = self.state();
        self.slocation.zip = self.zip();
        self.slocation.note = self.note();
        if (self.validate(self.slocation)) {
            self.save();
            self.title("Selected Location");
            self.mode("set");
            $(".linput").change(function () {
                self.mode("set");
            });
        }
    };
    self.removeLocation = function () {
        self.locations.remove(this);
    };
    self.zipLookup = function(lookup) {
        if (lookup) {
            $('#ziplookup').show();
            $('#citystatezip').hide();
            $("#zipl").keyup(function() {
                var el = $(this);
                if ((el.val().length == 5) && (is_int(el.val()))) {
                    var zip = el.val();
                    var lat;
                    var lng;
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ 'address': zip }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            geocoder.geocode({ 'latLng': results[0].geometry.location }, function(results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    if (results[1]) {
                                        self.getCityState(results);
                                        self.zip(zip);
                                        $('#ziplookup').hide();
                                        $('#citystatezip').show();
                                    }
                                }
                            });
                        }
                    });
                } 
            });
        }
        else {
            $('#ziplookup').hide();
            $('#citystatezip').show();
        }
    };
    self.newLocation = function () {
        self.name("");
        self.address("");
        self.address2("");
        self.city("");
        self.state("");
        self.zip("");
        self.note("");
        self.mode("new");
        self.title("New location");
        self.show(true);
        self.zipLookup(true);

    };
    self.inputLocation = function () {
        self.name("");
        self.address("");
        self.city("");
        self.state("");
        self.zip("");
        self.note("");
        self.mode("input");
        self.title("Enter location");
        self.show(true);
        self.zipLookup(true);

    };
    self.clearLocation = function () {
        self.locations.length = 0;
        self.locations.removeAll();
    };
    self.zipLookup(true);
}

// display combo
function Dcombo(cart) {
    var self = this;
    self.cart = cart;
    self.type = ko.observable('');
    self.sizes = ko.observableArray();
    self.includes = ko.observableArray();
    self.options = ko.observableArray();
    self.dummy = ko.observable();
    self.selects = ko.observableArray();
    self.dInclude = {};
    self.item = {};
    self.itemStateData = {};

    self.selectsPrice =  ko.computed(function () {
        var price = 0;
    $.map(self.selects(), function (n) {
      if (n.selected()) price += parseFloat(n.selected().option.price) || 0 ;
      });
        return price;
    });        
    self.selectName = ko.observable("");
    self.sizeName = ko.observable("");
    self.selected = ko.observable("");
    self.itemName = ko.observable("");
    self.price = ko.observable(0);
    self.quantity = ko.observable(1);
    self.description = ko.observable("");
    self.note = ko.observable('');
    self.showNote = ko.observable(false);
    self.noteLink = ko.observable("+ special instructions");
    self.showSizes = ko.observable(false);
    self.selectedSize = ko.observable();
    self.itemDisabled = ko.observable(false);
    self.qinc = function () {
        var q = self.quantity();
        if (q < 100) q += 1;
        self.quantity(q);
    };
    self.qdec = function () {
        var q = self.quantity();
        if (q > 0) q -= 1;
        self.quantity(q);
    };
    self.subtotal = ko.computed(function () {
       self.dummy();
        var includePrice =0;
        self.includes();
        $('.include input[type="checkbox"]:checked').each( function() {
            includePrice += (parseFloat($(this).attr('price')) || 0);
        });
        var selectprice =self.selectsPrice();
        return formatCurrency((self.quantity() * (parseFloat(self.price()) + selectprice + includePrice)));
    });
   
    self.line = ko.computed(function () {
        var note = "";
        var includes = "";
        var selects = "";
        var description = "";
        if (self.description().length) description = " " + self.description();
        if (self.includes().length) {
            var temp = $.map(self.includes(), function (sn) {
                var includeSelected = sn.includeSelected();
                var e = includeSelected.indexOf("Everything");
                if (e > -1) includeSelected = sn.listName + " : " + "Everything";
                return includeSelected;
            }).toString();
            var c = temp.lastIndexOf(",");
            if (c == temp.length-1) temp = temp.substr(0, c);
            if (temp!="") includes = "[" + temp + "]";
        };
        if (self.selects().length) {
             temp = $.map(self.selects(), function (vn) {
                var selected = "";
                if (vn.selected()) selected =vn.selected().option.name;
                return vn.selectName + ": " + selected;
            }).toString();
            var n = temp.lastIndexOf(",");
            if (n == temp.length - 1) temp = temp.substr(0, n);
            selects = "[" + temp + "]";
        };

        if (self.showNote()) {
            if (self.note() != "")
                note = "| note: '" + self.note() +"'";
        };
        return { quantity: self.quantity(), item: self.itemName() + "| " + description + "| " + self.sizeName() + "| " + includes + "| " + selects + "| " + note, price: self.price(), subtotal: self.subtotal() };
    });
    self.toggleNote = function () {
        if (self.showNote()) {
            self.showNote(false);
            self.noteLink("+ special instructions");
        } else { self.showNote(true); self.noteLink("- special instructions"); $('#itemnotetext').focus(); }
    };
    self.cancelNote = function() {
        self.note("");
        self.showNote(false);
    };
    self.submit = function () {
         $.ionSound.play("CGM Add to Order");
        //$.ionSound.play("CGM Order Completed");
        setTimeout(function () {
            $('#dcombo').popup("close", { transition: "slideup" });
        }, 100);
 
        vm.order.status("");
        self.cart.addLine(self.line()); 

        self.item.includes = self.dInclude;
        self.cancelNote();
    };
    self.cancel = function () {
        // reset sides
         $.ionSound.play("quick-blip");
        vm.order.status("");
        self.item.includes = self.dInclude;
        self.cancelNote();
        $('#dcombo').popup("close");
    };
    self.recalc = function() {
            self.dummy.notifySubscribers();
        }; 

};

function Order(socket, sessionId) {
    var self = this;
    self.orderto = "";
    self.vendor = vendor;
    self.from = ko.observable('');
    self.number = ko.observable('');
    self.name = ko.observable('');
    self.socket = socket;
    self.sessionId = sessionId;
    self.date = ko.observable('');
    self.lines = ko.observableArray();
    self.status = ko.observable('');
    self.message = ko.observable('');
    self.dinetype = ko.observable();
    self.deliveryLocation = ko.observable();
    self.total = ko.observable('');
    self.external = ko.observable();
    self.toJSON = function () {
        var order = {
            "number": self.number(), "date": self.date(), "lines": self.lines(), "total": self.total(),
            "deliveryLocation": JSON.stringify(self.deliveryLocation()), "dinetype": self.dinetype(),
            "external" : self.external
        };
        return order;
    };
};

function User(vendor) {
    var self = this;
    self.name = ko.observable();
    self.phone = ko.observable();
    self.email = ko.observable();
    self.history = ko.observableArray();
    self.favorite = ko.observable();
    var user = {};
    var vendors = {};
    self.load = function () {
        var luser = amplify.store('vuser');
        var lvendors = amplify.store('vendors');
        if (luser) user = luser;
        if (lvendors) vendors = lvendors;
        var name = user.name || "";
        var phone = user.phone || "";
        var email = user.email || "";
        if (typeof user.vendors == 'undefined') user.vendors = {};
        if (typeof user.vendors[vendor.phone] == 'undefined') user.vendors[vendor.phone] = {};
        if (typeof user.vendors[vendor.phone].history == 'undefined') user.vendors[vendor.phone].history = [];
        if (typeof vendors[vendor.phone] == 'undefined') vendors[vendor.phone] = {"name" : vendor.name, "phone": vendor.phone, "lastorder": {}, favorder: {} };
        var history = user.vendors[vendor.phone].history;
        for (var i = 0; i < history.length; i++) {
            self.history.push(history[i]);
        };
        //if (typeof user.vendors[vendor.phone].favorite == 'undefined') user.vendors[vendor.phone].favorite = {};
        self.name(name);
        self.phone(phone);
        self.email(email);
    };
    self.save = function () {
        amplify.store('vuser', user);
        amplify.store('vendors', vendors);
    };
    self.addHistory = function (order) {
        user.vendors[vendor.phone].history.push(order);
        vendors[vendor.phone].lastorder = order;
        self.history.push(order);
        self.save();
    };
    self.removeHistory = function (index) {
        user.vendors[vendor.phone].history.splice(index, 1);
        self.history().splice(index, 1);
        self.history.valueHasMutated();
        self.save();
    };
    self.showHistory = ko.computed(function () {
        var count = self.history().length;
        if (count) return true;
        else return false;
    });
}

function Vendor(vendor) {
    var self = this;
    self.phone = ko.observable(vendor.phone);
    self.name = ko.observable(vendor.name);
    self.location = ko.observable(vendor.location);
    self.status = ko.observable("");

    self.isOnline = function(vOn) {
        if (vOn) {
            self.status("Online");
            $('#vendorstatus').css("color", "yellowgreen");
            //if (showStatus && !phoneRegistered) registerPhone();
        } else {
            self.status("Offline");
            $('#vendorstatus').css("color", "orangered");
        }
    };
    $.ajax({
        url: "/vendorOnline/" + vendor.phone,
        type: "GET",
        async: false,
        dataType: 'json'
    }).done(function (data) {

        vendor.isOnline = data.isOnline;
        self.isOnline(data.isOnline);
    });
    self.locationlinkAddress = ko.computed(function () {
        return 'http://maps.google.com/?q=' + self.location().address + ',' + self.location().city + ',' + self.location().state + ',' + self.location().zip;
    }, this);

    self.dinetypes = ko.observableArray(vendor.dinetypes);
   
    
};

function sizeChanded() {
    //vm.dcombo.sizeName(sizeName);
};

// keep alive ping
function checkOnline(phone, socket) {
    var data = { "phone": phone };
    socket.emit('ping', data);
};

function binditem() {
    $('*').bind('mousemove keydown scroll click', function () {
        clearTimeout(idleTimer);
        idleState = false;
        idleTimer = setTimeout(function () {
            var redir = true;
            if (vm.vendor.status() =="Offline") redir = false;
            if (idleOff) redir = false;
           if (redir) window.location.replace("http://clickget.me");

        }, idleWait);
    });
    $("#autocomplete").autocomplete({
        source: vendorItems,
        select: function (event, ui) {
            var popItem = 'div[menuid="' + ui.item.menuId + '"][groupid="' + ui.item.groupId + '"][itemid="' + ui.item.itemId + '"]';
            $('#autocomplete').val("").blur();
            $(popItem).click();
                return false;
            }
    });
    $('ul.ui-autocomplete').css({ height: '12.5em', overflow: 'auto', 'font-size': '1em', background: 'white' });


    $('div.item').click(function () {
        if (vm.order.status() == "received" || vm.order.status() == "processing" || vm.order.status() == "ready") return;
        currentOrderStatus = vm.order.status();
        vm.order.status('Selecting');
        $.ionSound.play("CGM Click");
        var self = this;
        var itemId = $(self).attr('itemId');
        var groupId = $(self).attr('groupId');
        var menuId = $(self).attr('menuId');
        var menu = menus[menuId];
        var groups = menu.groups;
        var group = groups[groupId];
        var item = group.groupItems[itemId];
        var itemName = item.itemName;
        var description = item.itemDescription;
        var itemSizes = item.itemSizes;
        var price = itemSizes[0].sizePrice;
        vm.dcombo.itemName(itemName);
        vm.dcombo.item = item;
        vm.dcombo.sizeName(itemSizes[0].sizeName);
        var dInclude = JSON.parse(JSON.stringify(item.includes));
        vm.dcombo.dInclude = dInclude;
        var includes = $.map(item.includes, function (n, i) {
            return { listName: n.listName, includeList: ko.observableArray(item.includes[i].includeList), includeSelected: ko.observableArray(item.includes[i].includeSelected) };
        });
        vm.dcombo.includes(includes);
        var dSelected = [];
        var oSelected = [];
        var selects = $.map(item.selects, function (n) {

            if (n.selectDefault) {
                dSelected.push(n.selectDefault.option.name);
                oSelected.push({ "option": n.selectDefault.option });
            };
            return { selectName: n.selectName, options: ko.observableArray(n.options), selected: ko.observable(n.selectDefault) };
        });
        vm.dcombo.selects(selects);
        vm.dcombo.selectedSize(itemSizes[0].sizeName);
        if (itemSizes.length == 1) vm.dcombo.showSizes(false); else vm.dcombo.showSizes(true);
        vm.dcombo.description(description);
        vm.dcombo.sizes(itemSizes);
        vm.dcombo.price(price);
        vm.dcombo.quantity(1);
        $('#dcombo').trigger('create');
        $('#dcombo').popup({ positionTo: "window", overlayTheme: "b", dismissible: false, transition: "pop", afteropen: function (event, ui) {

        }
        });
        $('#dcombo').popup("open");
        $("#Everything").change(function () {
            if ($(this).is(':checked')) {
                $("#Everything").parent().parent().children().not($("#Everything").parent()).hide();
            } else {
                $("#Everything").parent().parent().children().show();
            }

        });

        $(".includecheckbox").change(function () {
            vm.dcombo.recalc();
        });
        $('.sizes label').css('color', 'lightsteelblue');
        $('.sizes label[for="' + itemSizes[0].sizeName + '"]').css('color', 'pink');
        for (var i = 0; i < vm.dcombo.includes().length; i++) {
            var include = vm.dcombo.includes()[i];
            include.includeList.push({ "include": { "name": "", "price": ""} });
            include.includeList.pop();
            include.includeSelected.push("");
            include.includeSelected.pop();
        };
        for (var j = 0; j < vm.dcombo.selects().length; j++) {
            var select = vm.dcombo.selects()[j];
            var id = "#" + select.selectName;
            var inputText = dSelected[j];
            // $(id + " option:contains(" + inputText + ")").attr('selected', 'selected');
            $(id + " option:contains(" + inputText + ")").prop('selected', true);
            select.selected(oSelected[j]);
        };
        $('.radioSize').click(function () {
            $.ionSound.play("CGM Click");
            var sizeName = $(this).attr('sizeName');
            var sizePrice = $(this).attr('sizePrice');
            $('.sizes label').css('color', 'lightsteelblue');
            $(this).attr("checked", true);
            $(this).parent().css('color', 'pink');
            vm.dcombo.sizeName(sizeName);
            vm.dcombo.price(sizePrice);
        });
    });
    $('div.cggroup').off('click');
    $('div.cggroup').on('click', function () {
        var self = this;
        $(self).scrollTop(0);
    });
    $('#vendortag').off('click');
    $('#vendortag').on('click', function () {
        setTimeout(function () {
            $('#popupAddress').popup({ positionTo: "window", overlayTheme: "b", theme: "b", dismissible: true, transition: "slidedown" });
            $('#popupAddress').popup("open");
        }, 500);
           
    });
}

function pagefix(){

    //var screen = $(window).outerHeight(),
    //footer = $('#shoppingcharthead').outerHeight(),
    //menuHeight = $('#menus').outerHeight(),
    //menuBottom = $('#menubottom').outerHeight();
    //if ((menuHeight + footer) < screen) {
    //    var diff = screen - (menuHeight + footer) + 5;
    //    $('#menubottom').css("height", menuBottom + diff);
    //};
    };
window.onresize=function() { pagefix(); };
$(document).ready(function () {
    var user = {};
    var luser = amplify.store('user');
    var guser = amplify.store('guser');
    if (!luser) user = { name: "guest", email: "", phone: "", carrier: "", signedIn: false };
    else user = jQuery.parseJSON(luser);

    // load audio
    $.ionSound({
        sounds: [
                "CGM Welcome",
                "Ringin",
                "ringout",
                "recycle",
                "Logoff",
                "Logon",
                "quick-blip",
                "Alarm",
                "Notify",
                "success",
                "complete",
                "CGM Add to Order",
                "CGM Delivery on its Way",
                "CGM Order Completed",
                "CGM Order Incoming",
                "CGM Order Processing",
                "CGM Order Ready",
                "CGM Order Received",
                "CGM Click",
                "door_bell"

            ],
        path: "/sounds/",
        multiPlay: true,
        volume: "1.0"
    });
    var socket = io.connect();

    var sessionId = "";
    var connected = false;
    var showStatus = true;
    if (getUrlVars()["fromiframe"] == "true") {
        showStatus = false;
        idleOff = true;
        $('.titlebar').css("dislay", "none");

        $('#orderinfo').css("display", "none");

        user = { name: "me", email: "", phone: "", carrier: "", signedIn: true };
    };
    socket.on('connect', function () {
        if (!connected) {
            sessionId = this.socket.sessionid;
            if (showStatus) socket.emit('setvendorcustomer', { "phone": vendor.phone, "sessionId": sessionId });
            var register = new Register(user);
            var vuser = new User(vendor);
            var cart = new Cart(socket, sessionId, vendor, user, vuser, pending, showStatus);

            vuser.load();
            var dcombo = new Dcombo(cart);
            var order = new Order(socket, sessionId, vendor);
            var mylocation = new MyLocation();
            vm = { cart: cart, dcombo: dcombo, order: order, vendor: new Vendor(vendor), register: register, vuser: vuser, mylocation: mylocation };
            ko.applyBindings(vm);
            initializeSocket();
            // syncid = setInterval(function () {
            //      checkOnline(vendor.phone, socket);
            // }, 24000);
            binditem();
            // schrool to center
            $(".cggroup").on("collapsibleexpand", function (event, ui) {
                var eOffset = $(event.target).offset().top;
                $('#menus').scrollTop(eOffset);
            });
            $('#orderhistory').click(function () {
                if (!vm.vuser.history().length) return;
                $('#userhistory').popup({ positionTo: "window", overlayTheme: "b", theme: "b", dismissible: true, transition: "slideup" });
                $('#userhistory').popup("open");
                $('.historder').off('click');
                $('.histrorder').on('click', function () {
                    var histid = $(this).attr('histi');
                    if (typeof histid == 'undefined') return;
                    var lines = vm.vuser.history()[histid].lines;
                    vm.cart.concatLine(lines);
                    $('#userhistory').popup("close");
                });
                // histdelete 
                $('.histdelete').off('click');
                $('.histdelete').on('click', function () {
                    var histid = $(this).attr('histi');
                    //var lines = vm.vuser.history()[histid].lines;
                    //vm.cart.concatLine(lines);
                    vm.vuser.removeHistory(histid);
                    if (!vm.vuser.history().length) $('#userhistory').popup("close");
                });
            });
            $('#shdetail').off('click');
            $('#shdetail').on('click', function () {
                if ((vm.order.status() == "received") || (vm.order.status() == "processing") || (vm.order.status() == "ready")) {
                    $('#orderDialogPage').popup({ positionTo: "window", overlayTheme: "b", theme: "b", dismissible: false, transition: "pop" });
                    $('#orderDialogPage').popup("open");
                    return;
                }
                if (vm.cart.lines().length == 0) return;
                $('#shoppingdetails').popup({ positionTo: "window", overlayTheme: "b", theme: "b", dismissible: true, transition: "slideup" });
                $('#shoppingdetails').popup("open");
                $('#shclear').off('click');
                $('#shclear').on('click', function () {
                    $('#shoppingdetails').popup("close");
                });
                $('#shcancel').off('click');
                $('#shcancel').on('click', function () {
                    $('#shoppingdetails').popup("close");
                });
            });
            connected = true;
        } else {
            console.log("reconnected:" + new Date());
        }
        if (pending.status) {

        }
    });
    socket.on('connect_failed', function (data) {
        console.log(data || 'connect_failed');
    });
    function initializeSocket() {
        socket.on('sendorder', function (data) {
            if (data.from != sessionId) return;

            if (data.from == sessionId) {
                if (showStatus) {
                    updateClock();
                    clockid = setInterval('updateClock()', 1000);
                    vm.order.lines(data.orderLines);
                    vm.order.name(data.ordername);
                    vm.order.status('sending...');
                    $.ionSound.play("ringout");
                    vm.order.total(data.total);
                    vm.order.date(data.date);
                    vm.order.dinetype(data.dinetype);
                    vm.order.deliveryLocation(data.deliveryLocation);
                    $('#orderDialogPage').popup({ positionTo: "window", overlayTheme: "b", theme: "b", dismissible: false, transition: "pop" });
                    $('#orderDialogPage').popup("open");
                    $('#btorderclose').off('click');
                    $('#btorderclose').on('click', function () {
                        $('#orderDialogPage').popup("close");
                    });
                }
            }
        });
        socket.on('updateorder', function (data) {
            if (data['for'] == sessionId) {
                vm.order.lines(data.orderLines);
                vm.order.status('sending...');
                vm.order.total(data.total);
                vm.order.date(data.date);
                vm.order.dinetype(data.dinetype);
                vm.order.deliveryLocation(data.deliveryLocation);
                vm.cart.sendOk(false);
                if (showStatus) {
                    $.ionSound.play("Ringin");
                    $('#orderDialogPage').popup({ positionTo: "window", overlayTheme: "b", theme: "b", dismissible: false, transition: "pop" });
                    $('#orderDialogPage').popup("open");
                    $('#btorderclose').on('click', function () {
                        $('#orderDialogPage').popup("close");
                    });
                }
            }
        });
        socket.on('updatestatus', function (data) {
            if (data.sessionId == sessionId) {
                idleOff = true;
                
                switch (data.status) {
                    case "received":
                        vm.order.status("has been received");
                        break;
                    case "ready":
                        vm.order.status("is ready");
                        break;
                    case "Delivering":
                        vm.order.status("is being delilivered");
                        break;
                    case "on its way":
                        vm.order.status("is ready");
                        break;
                    case "processing":
                        vm.order.status("is being processed");
                        break;
                    case "arrived":
                        vm.order.status("has Arrived");
                        break;
                    default:
                            
                        break;
                };
                vm.order.message(data.message);

                vm.order.number(padZeros(data.number, 3));
                if (showStatus) {
                    pending.order.message = data.message;
                    pending.order.status = data.status;
                    pending.save();

                    $('#orderDialogPage').popup({ positionTo: "window", overlayTheme: "b", theme: "b", dismissible: false, transition: "pop" });
                    $('#orderDialogPage').popup("open");
                    $('#btordercancel').click(function () {
                        jQuery.ajax({
                            type: "POST",
                            data: { "vendorPhone": vendor.phone, "orderId": data.id, "status": "canceled" },
                            url: '/updateOrder',
                            success: function () {
                                socket.emit('cancelorder', { "phone": vendor.phone, "id": data.id });
                                pending.clear();
                                $('#orderDialogPage').popup("close");
                                vm.cart.sendOk(true);
                                vm.order.status("");
                                return;
                            },
                            async: false
                        });

                    });
                };
                if (!showStatus) {
                    if (data.status == "received") {
                        vm.cart.clearLines();
                        vm.order.status("");
                    };
                };


                if (data.status == "received" && showStatus) $.ionSound.play("CGM Order Received");
                if (data.status == "processing" && showStatus) $.ionSound.play("CGM Order Processing");
                if (data.status == "ready" && showStatus) $.ionSound.play("CGM Order Ready");
                if (data.status == "delivering" && showStatus) $.ionSound.play("CGM Delivery on its Way");
                if (data.status == "delivered" && showStatus) $.ionSound.play("Notify");
                if (data.status == "arrived" && showStatus) $.ionSound.play("door_bell");
                if (data.status == "closed" && showStatus) {
                    pending.clear();
                    var order = vm.order.toJSON();
                    vm.vuser.addHistory(order);
                    $('#orderDialogPage').popup('close');
                    clearInterval(clockid);
                    vm.cart.clearLines();
                    $.ionSound.play("CGM Order Completed");
                    vm.order.status("closing");
                    setTimeout("thankyou()", 2000);
                    socket.emit('clearvendorcustomer', { "phone": vendor.phone, "sessionId": sessionId });
                    socket.emit('custconnect', { "phone": vendor.phone });

                };

            }
        });
        socket.on('pingBack', function () {
            setTimeout(function () {
                socket.emit('ping', { "phone": vendor.phone, "sessionId": sessionId });
            }, 24000);

        });
        socket.emit('ping', { "phone": vendor.phone, "sessionId": sessionId });
        socket.emit('custconnect', { "phone": vendor.phone });
    };
    $('#registerLink').click(function () {
        $('#register').popup({ positionTo: "window", overlayTheme: "b", theme: "b", dismissible: true, transition: "slidedown" });
        $('#register').popup("open");
    });
    socket.on('isonline', function (data) {
        if (data.phone == vendor.phone) {
            //clearInterval(syncid);
            if (!showStatus) binditem();
            // var synctime = showStatus ? 26000 : 24000;
            // syncid = setInterval(function () {
            //    checkOnline(vendor.phone, socket);
            // }, synctime);
            vendor.isOnline = data.isOnline;
            vm.vendor.isOnline(data.isOnline);
        }
    });
    $(document).on("mobileinit", function () {
        $.mobile.loader.prototype.options.text = "loading";
        $.mobile.loader.prototype.options.textVisible = false;
        $.mobile.loader.prototype.options.theme = "a";
        $.mobile.loader.prototype.options.html = "";
    });
    $(window).load(function () {
        $('#cgsmile1').hide();
        $('#clickgetme').removeClass('loading');
        pagefix();
        setTimeout(function () {
            if (!showStatus) $.ionSound.play("CGM Welcome");
        }, 100);

        if (showStatus && !phoneRegistered)
            setTimeout(function () {
                registerPhone();
            }, 1000);


    });
    $(window).onbeforeunload = function () {
        socket.emit('clearvendorcustomer', { "phone": vendor.phone, "sessionId": sessionId });
    };
});

