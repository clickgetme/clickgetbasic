define(['OrderTakerView', 'text!templates/index.html', 'models/Vendor'],
function(OrderTakerView, indexTemplate, Vendor) {
  var indexView = OrderTakerView.extend({
      el: $('#content'),


    events: {
        "click #registerVendor " : "registerVendor",
        "click #createMenu": "createMenu"
        //, "submit form": "getMenu"
    },

    initialize: function(options) {
    },

    onVendorCollectionReset: function (collection) {
      var that = this;
      collection.each(function (model) {
        that.onStatusAdded(model);
      });
    },


    registerVendor: function() {
        window.location.hash = 'registerVendor';

    },

    createMenu: function () {
        window.location.hash = 'createMenu';

    },


    render: function() {
      this.$el.html(indexTemplate);
    }
  });

  return indexView;
});