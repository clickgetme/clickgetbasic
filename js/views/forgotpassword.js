define(['OrderTakerView', 'text!templates/forgotpassword.html'], function(OrderTakerView, forgotpasswordTemplate) {
  var forgotpasswordView = OrderTakerView.extend({
    requireLogin: false,

    el: $('#content'),

    events: {
      "submit form": "password"
    },

    password: function() {
      $.post('/forgotpassword', {
        email: $('input[name=email]').val()
      }, function(data) {
        console.log(data);
      });
      return false;
    },

    render: function() {
      this.$el.html(forgotpasswordTemplate);
    }
  });

  return forgotpasswordView;
});
