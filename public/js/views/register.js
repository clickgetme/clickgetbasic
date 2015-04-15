define(['OrderTakerView', 'text!templates/register.html'], function(OrderTakerView, registerTemplate) {
  var registerView = OrderTakerView.extend({
    requireLogin: false,

	el: $('#content'),

    events: {
      "submit form": "register"
    },

    register: function() {
        $.post('/register', {
            email: $('input[name=email]').val(),
            password: $('input[name=password]').val(),
            firstName: $('input[name=firstName]').val(),
            lastName: $('input[name=lastName]').val(),
            phone: $('input[name=phone]').val()
      }, function(data) {
        console.log(data);
      });
      return false;
    },

    render: function() {
      this.$el.html(registerTemplate);
    }
  });

  return registerView;
});
