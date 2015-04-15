require.config({
  paths: {
    jQuery: '/js/libs/jquery',
    Underscore: '/js/libs/underscore',
    Backbone: '/js/libs/backbone',
    Sockets: '/socket.io/socket.io',
    models: 'models',
    text: '/js/libs/text',
    templates: '../templates',

    OrderTakerView: '/js/OrderTakerView'
  },
  shim: {
    'Backbone': ['Underscore', 'jQuery'],
    'OrderTaker': ['Backbone']
  }
});

require(['OrderTaker'], function(OrderTaker) {
  OrderTaker.initialize();
});
