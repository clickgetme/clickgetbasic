
function Users() {
    var self = this;
    self.users = ko.observableArray();
    self.userName = ko.observable("");
    self.password = ko.observable("");
    self.roles = ko.observable("");
    self.userPhone = ko.observable("");

    self.getUsers = function () {
        $.get('/users/' + vendor.phone, function (data) {
            return data;
        });
    };
    self.addUser= function() {
        var User= {
            "userName": self.userName,
            "password": self.roles,
            "userPhone": self.userPhone
        };
        self.users.push(user);
    };
    self.setUser= function () {
        self.userName(this.userName);
        self.roles(this.roles);
        self.userPhone(this.userPhone);
    };
    self.removeUser= function () {
        self.users.remove(this);
    };
}