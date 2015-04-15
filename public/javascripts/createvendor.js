function Vendor() {
    var self = this;
    self.name = ko.observable("");
    self.phone = ko.observable("");
    self.email = ko.observable("");
    self.address = ko.observable("");
    self.city = ko.observable("");
    self.state = ko.observable("");
    self.zip = ko.observable("");
    self.eatIn = ko.observable();
    self.eatInName = ko.observable("Eat In");
    self.takeOut = ko.observable();
    self.takeOutName = ko.observable("Take Out");
    self.delivery = ko.observable();
    self.deliveryName = ko.observable("Delivery");
    

    self.save = function () {
        var dineTypes = [];
        if (self.eatIn()) dineTypes.push({ type: "eatin", name: self.eatInName() });
        if (self.takeOut()) dineTypes.push({ type: "takeout", name: self.takeOutName() });
        if (self.delivery()) dineTypes.push({ type: "delivery", name: self.deliveryName() });
        var location ={ "address": self.address(), "city": self.city(), "state": self.state(), "zip": self.zip(), "phones":[{"type":"store", "number": self.phone()}] } ;
        //   "zip": "44135", "phones": [{ "type": "Mobile", "number": "4048403559" }, { "type": "Home", "number": "2169410931" }] } 
        var url = "http://clickgetbasic.azurewebsites.net/orderfrom/" + self.phone() + "/";
 //       return;
        $.get('qrctext',
            function (data) {
                var qrchtml = data.replace("This is my QR code", url);
                var vendor = { "name": self.name(), "phone": self.phone(), "email": self.email(), "dinetypes": dineTypes, "location": location };
                $.post("/newvendor", { phone: self.phone(), vendor: vendor, qrchtml: qrchtml })
                .done(function (cdata) {
                    if (cdata == 'OK') window.location = window.location.origin + '/menubuilder/' + self.phone();
                });
        });

    };
};

// var vendor={name: "ClickGetMe Demo", phone: "2542543863", dinetypes: [{ type: "takeout", name: "Take Out" }, { type: "eatin", name: "Eat in" }, { type: "delivery", name: "Delivery" }], location: { "address": "12621 grimsby ave.", "city": "Cleveland", "state": "OH", "zip": "44135", "phones": [{ "type": "Mobile", "number": "4048403559" }, { "type": "Home", "number": "2169410931" }] } };
$(document).ready(function () {
   
        var vendor = new Vendor();
        ko.applyBindings(vendor);
    


});