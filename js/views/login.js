define(['OrderTakerView', 'text!templates/login.html'], function(OrderTakerView, loginTemplate) {
  var loginView = OrderTakerView.extend({
    requireLogin: false,

    el: $('#content'),

    events: {
      "submit form": "login"
    },

    initialize: function(options) {
      this.socketEvents = options.socketEvents;
    },

    login: function() {
      var socketEvents = this.socketEvents;
      $.post('/login',
        this.$('form').serialize(), function(data) {
          socketEvents.trigger('app:loggedin', data);
          window.location.hash = 'index';
      }).error(function(){
        $("#error").text('Unable to login.');
        $("#error").slideDown();
      });
      return false;
    },

    render: function() {
      this.$el.html(loginTemplate);
      $("#error").hide();
      $("input[name=email]").focus();
    }
  });

  return loginView;
});
