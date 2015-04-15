define(['models/UserCollection'], function(UserColleciton) {
  var User = Backbone.Model.extend({
    urlRoot: '/users',

    initialize: function() {

    }
  });

  return User;
});
