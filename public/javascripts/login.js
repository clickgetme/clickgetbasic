


$(document).ready(function() {
    $.get('/users/authenticated/' + vendor.phone)
        .done(function() {
            alert("logged in");
        })
        .fail(function() {
            $('#login').popup({
                positionTo: "window", overlayTheme: "b", theme: "b", dismissible: false, transition: "pop", afteropen: function (event, ui) {
                    login();
                }
            });
            $('#login').popup("open");
    });
});
