
$(document).ready(function () {
    jQuery.ajax({
        type: "POST",
        url: '/demologin',
        success: function () {
            window.location = "/orderview/2542543863#DEMO"

        },
        async: false
    });

});

   

