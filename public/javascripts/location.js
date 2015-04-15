

function MyLocation() {
    var self = this;
    self.locations = ko.observableArray();
    self.name = ko.observable("");
    self.address = ko.observable("");
    self.city = ko.observable("");
    self.state = ko.observable("");
    self.zip = ko.observable("");
    self.note = ko.observable("");
    self.show= ko.observable(false);
    self.addLocation = function() {
        var location = {
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "zip": self.zip,
            "note": self.note
        };
        self.locations.push(location);
    };
    self.setLocation = function () {
        self.name(this.name);
        self.address(this.address);
        self.city(this.city);
        self.state(this.state);
        self.zip(this.zip);
        self.note(this.note);
    };
    self.removeLocation = function () {
        self.locations.remove(this);
    };
    self.clearLocation = function () {
        self.locations.length = 0;
        self.locations.removeAll();
    };
}