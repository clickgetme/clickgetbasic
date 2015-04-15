function StringBuilder(value) {
    this.strings = new Array("");
    this.append(value);
}

StringBuilder.prototype.append = function (value) {
    if (value) {
        this.strings.push(value);
    };
};

StringBuilder.prototype.clear = function () {
    this.strings.length = 1;
};

StringBuilder.prototype.toString = function () {
    return this.strings.join("");
};
function buildMenu(groups) {
    var html = new StringBuilder();
    var itemhtml = new StringBuilder();
    //
    html.append('<h6> menu: click &dArr; to select items </h6>');
    html.append('<div data-role="collapsible-set">');
    for (var g = 0; g < groups.length; g++) {
        var group = groups[g];
        var items = group.groupItems();
        var tabshtml = new StringBuilder();
        tabshtml.append('<div class="section-header" data-role="collapsible" data-collapsed-icon="arrow-d">');
        tabshtml.append('<h4>');
        tabshtml.append(group.groupName);
        tabshtml.append('</h4>');
        tabshtml.append('<div class="p control-group">');

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var name = item.itemName;
            var desc= item.itemDescription;
            var hideItem = "";
            if (!item.showItem) hideItem =" hideitem ";
            var price = "0.00";
            var sizes = item.itemSizes();
            var itemOptions = JSON.stringify(item.idos);
            var itemSizes = JSON.stringify(item.itemSizes);
            var sattrib = "";
            if (typeof item.selects != 'undefined') {
                sattrib = "selects ='" + '{"selectName":' + '"' + item.selects.name + '"' +
                    ', "selectList":' + JSON.stringify(item.selects.list) + "}' ";
            };

            var id = "";
            id = 'item' + g.toString() + i.toString();
            prices = "";
            for (var sz = 0; sz < sizes.length; sz++) {
                prices += '<div class="prices"><span class="sizename">' + sizes[sz].sizeName + '</span><span class="sizeprice">' + sizes[sz].sizePrice + '</span></div>';
            };
            itemhtml.clear();
            itemhtml.append('<div id="' + id + ' "class="ui-btn ui-btn-inline item' + hideItem + '" ');
            // attribute
            itemhtml.append('name ="' + item.itemName + '" ');
            itemhtml.append('prices = "' + price + '" ');
            itemhtml.append('desc = "' + desc + '" ');
            itemhtml.append('>');
            itemhtml.append('<div  class ="itn">' + name + '</div>');
            itemhtml.append('<div  class ="itd">' + desc + '</div>');
            itemhtml.append('<div class ="itp">' + prices + '</div>');
            itemhtml.append('</div>');
            tabshtml.append(itemhtml.toString());
        };
        tabshtml.append('</div></div>');
        html.append(tabshtml.toString());

        //console.log(tabshtml.toString());
    };

    html.append('</div></div>'); // close menu
    //html.append('<div class="menu status" data-bind="text:vendor.status"><div>');
    //console.log(html.toString());
    $('#menuPreview').html(html.toString());
    $('#menuPreview').trigger('create');
};
