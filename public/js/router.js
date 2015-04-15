define(['views/index', 'views/register',  'models/VendorCollection'],
function(IndexView, RegisterView, VendorCollection) {
  var OrderTakerRouter = Backbone.Router.extend({
    currentView: null,

    socketEvents: _.extend({}, Backbone.Events),

    routes: {    
      'index': 'index',
      'register': 'register'
    },

    changeView: function(view) {
      if ( null != this.currentView ) {
        this.currentView.undelegateEvents();
      }
      this.currentView = view;
      this.currentView.render();
    },

    index: function() {
      this.changeView(new IndexView());
    },
    vendor: function() {
        this.changeView(new VendorView());
    },
    register: function() {
      this.changeView(new RegisterView());
    }

  });

  return new OrderTakerRouter();
});

