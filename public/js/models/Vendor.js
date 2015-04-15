define(function (require) {
    var Vendor = Backbone.Model.extend({
        urlRoot: '/vendors',
        initialize: function () {
            this.vendor = new VendorCollection();
            this.vendor.url = '/vendors/' + this.id + '/vendor';
            
        }
    });

    return Vendor;
});
