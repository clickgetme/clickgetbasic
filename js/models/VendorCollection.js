define(['models/vendor'], function (vendor) {
    var VendorCollection = Backbone.Collection.extend({
        model: vendor
    });

    return VendorCollection;
});
