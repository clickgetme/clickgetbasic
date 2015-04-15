function formatPhone(phone) {
    if(typeof phone == 'undefined') phone = "";
    if (phone == "template") return "template";
    var fphone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 - $2 - $3");
    return fphone;
}
function iframeResizePipe() {
    // What's the page height?
    var height = document.body.scrollHeight;

    // Going to 'pipe' the data to the parent through the helpframe..
    var pipe = document.getElementById('helpframe');

    // Cachebuster a precaution here to stop browser caching interfering
    pipe.src = 'http://clickget.me/helper.html?height=' + height + '&cacheb=' + Math.random();

}
$(document).ready(function () {
    var vendors = {};
    var lvendors = amplify.store('vendors');
    if (lvendors) vendors = lvendors;
    var key;
    var domain = window.location.origin;
     $.get('/vendors',
            function (listdata) {
                    for (key in vendors) {
        if (listdata.indexOf(vendors[key].phone) > 0) 
        $( "#custlist" ).append(
        '<div class="vendor"><a href="/orderfrom/' + vendors[key].phone +'" target="_top"><div id="namenum"><span class="name"> ' + vendors[key].name + '</span>' 
        +'<span>' + formatPhone(vendors[key].phone)  +'</span></div><div id="cart"><i class="fa fa-shopping-cart"></i> </div> </a>'
        + '</div>'       
        );
    }

        });

    


});