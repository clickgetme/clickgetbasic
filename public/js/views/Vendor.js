define(['OrderTakerView', 'text!templates/registerVendor.html'],
    function (OrderTakerView, registerVendorTemplate) {
    var RegisterVendorView = OrderTakerView.extend({
        requireLogin: false,

        el: $('#content'),

        events: {
            "submit form": "Vendor"
        },

        Vendor: function () {
            $.post('/registerVendor', {
                name: $('input[name=name]').val(),
                email: $('input[name=email]').val(),
                password: $('input[name=password]').val(),
                phone: $('input[name=phone]').val(),
                countryName: $('input[name=countryName]').val(),
                localityName: $('input[name=localityName]').val(),
                postalCode: $('input[name=postalCode]').val(),
                regionName: $('input[name=regionName]').val(),
                streetAddress: $('input[name=streetAddress]').val(),
                fax: $('input[name=fax]').val()
            }, function (data) {
                console.log(data);
            });
            return false;
        },

        render: function () {
            this.$el.html(registerVendorTemplate);
        }
    });

    return RegisterVendorView;
});
