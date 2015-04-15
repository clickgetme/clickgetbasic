define(['models/User'], function (User) {
    var UserCollection = Backbone.Collection.extend({
        model: User
    });

    return UserCollection;
});
