

function getUrl() {
    $.get('/vendorAdminUrl', function (data) {
        
        window.location = data.url;
        
    });


}

$(document).ready(function () {
    var userName = "";
    var vendorPhone = "";
    var password = "";
    $('#lsubmit').off('click');
    $('#lsubmit').on('click', function () {
        userName = $("#luserName").val();
        vendorPhone = $("#lvphone").val();
        password = $("#lpassword").val();
        var userlogin = { "vendorPhone": vendorPhone, "userName": userName, "userPhone": userPhone, "password": password };
        jQuery.ajax({
            type: "POST",
            data: userlogin,
            url: '/vlogin',
            success: function (result) {
                if (result.loggedIn) {
                    var url = getUrl();
                }
            },
            async: false
        });
    });

});
