
Array.prototype.move = function (oldIndex, newIndex) {
    if (newIndex >= this.length) {
        var k = newIndex - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
    return this; // for testing purposes
};
function updateBindings() {
    //$('#menubuilder').trigger('create');
    $('a.showHideItems').click(function () {
        var self = this;
        var group = $(self).attr('group');
        if ($(self).text() == "Hide Items") {
            $(self).text("Show Items");
            $('#' + group).hide();
        } else {
            $(self).text("Hide Items");
            $('#' + group).show();
        };

    });
    $('a.showHideMenu').click(function () {
        var self = this;
        var menuId = $(self).attr('menuId');
        if ($(self).text() == "Hide Menu") {
            $(self).text("Show Menu");
            $('#menu' + menuId).hide();
        } else {
            $(self).text("Hide Menu");
            $('#menu' + menuId).show();
        };

    });

};

function updateGroupId(group, groupId) {
    var items = group.groupItems();;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        item.groupId = groupId;
        for (var s = 0; s < item.itemSizes() ; s++) {
            var size = itemSizes()[s];
            size.groupId = groupId;
        };
    };
};

function updateIds(xgroups) {
    var groups = xgroups;
    
    for (var g = 0; g < groups().length; g++) {
        var group = groups()[g];
        var groupId = g;
        var menuId = group.menuId;
        group.groupId = groupId;
        var items = group.groupItems();;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var itemId = i;
            item.itemId = itemId;
            item.groupId = groupId;
            item.menuId = menuId;
            for (var s = 0; s < item.itemSizes() ; s++) {
                var size = itemSizes()[s];
                size.menuId = menuId;
                size.groupId = groupId;
                size.itemId = itemId;
            };
        };
    };
    return groups();
};
function Include(si) {
    var inc = this;
    if (!si) si = { groupName: "", groupSelected: false, avail: [], selected: [], setTrue: [] };

    inc.groupName = si.groupName;
    inc.groupSelected = si.groupSelected;
    inc.avail = ko.observableArray(si.avail);
    inc.selected = ko.observableArray(si.selected);
    inc.setTrue = ko.observableArray(si.setTrue);

};
function initialize(menus) {
    // initialize menu construct
    for (var m = 0; m < menus.length; m++) {
        var menuId = m;
        var menu = menus[m];
        delete menu.si;
        delete menu.id;
        menu.menuId = menuId;
        menu.schedule = {};
        var groups = menu.groups;
        var groupCount = 0;
        for (var g = 0; g < groups.length; g++) {
            var group = groups[g];
            var groupId = groupCount;
            delete group.si;
            group.groupId = groupId;
            group.menuId = menuId;

            var items = group.groupItems;
            var itemCount = 0;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var itemId = i;
                item.itemId = itemId;
                item.groupId = groupId;
                item.menuId = menuId;
                delete item.si;
                item.exo = {};
                //item.title = "";
               // item.extra = "";
                //delete item.includes;
                //item.includes = [];
                //item.selects = [];
                item.additions = [];
                for (var s = 0; s < item.itemSizes.length; s++) {
                    var size = item.itemSizes[s];
                    size.id = s;
                    size.menuId = menuId;
                    size.groupId = groupId;
                    size.itemId = itemId;
                    delete size.enabled;
                    size.sizeEnabled = true;
                }
                itemCount++;

            };
            groupCount++;

        };
    };
    var menusString = JSON.stringify(menus);
    $.post("../savevendormenu", { vendorPhone: vendor.phone, menus: menusString });
    alert("menus saved");
};
function optionprice(include) {
    var temp = '{"include": {"name": "' + include.name + '", "price": "' + include.price + '"}}';
    return temp;
};
function List(list) {
    var self = this;
    self.listName = list.listName ;
    self.list = ko.observableArray(list.list);
    self.listItem = ko.observable("");
};
function Menu(menus, lists) {
    var self = this;
    self.intialize = function () {
        initialize(menus);};
    self.selects = ko.observableArray();
    self.includes = ko.observableArray();
    self.includeListName = ko.observable("");
    self.selectListName = ko.observable("");
    self.selectedListName = ko.observable("");
    self.selectsListNames = ko.observableArray();
    self.selectOptions = ko.observableArray();
    self.addSelect = function () {
        var selectListName = $('#selectListName').val();
        var crLists = self.listObject[self.selectedListName()];
        var options = $.map(crLists, function (n, i) {
            return { option: { "name": crLists[i], "price": ko.observable("") } };
        });
        var select = { "sourceName": self.selectedListName(), "selectDefault": "", "selectName": selectListName, "selectList": ko.observableArray(), "options": ko.observableArray(options) };
        self.selects.push(select);
    };
    self.removeSelect = function (select) {
        self.selects.remove(select);
    };
    self.addIncludes = function () {
        var listName = self.includeListName();
        var xlists = self.listObject[listName];
        var iLists = $.map(xlists, function (val) {
            return { include: { name: val, price: "" } };
        });
        self.includes.push({ listName: listName, includeSelected: ko.observableArray(), includeList: ko.observableArray(), list: ko.observableArray(iLists) });
    };
    self.removeIncludes = function (include) {
        self.includes.remove(include);
    };

    self.listObject = {};
    function updateListObject() {
        self.listObject = {};
        self.selectsListNames = [];
        for (var i = 0; i < lists.length; i++) {
            var list = lists[i];
            self.listObject[list.listName] = list.list;
            self.selectsListNames.push(list.listName);
        };
    };
    updateListObject();
    self.lists = ko.observableArray(ko.utils.arrayMap(lists, function (list) {
        return {
            listName: list.listName,
            list: ko.observableArray(list.list),
            listItem: ko.observable("")
        };
    }));
    self.listName = ko.observable("");
    self.addList = function () {
        var list = new List({listName: self.listName(), list:[]});
        self.lists.push(list);
        self.selectsListNames.push(list.listName);
        self.listName("");
        updateListObject();
    };
    self.removeList = function (list) {
        self.lists.remove(list);
        updateListObject();
    };
    self.addListItem = function (list) {
        if (list.listItem()) {
            list.list.push(list.listItem());
            list.listItem("");
            updateListObject();
        };
    };
    self.removeListItem = function(list) {
        $.each(self.lists(), function() { this.list.remove(list); });
        updateListObject();
    };

    // initialize 
    //   initialize(menus);
    self.menus = ko.observableArray(ko.utils.arrayMap(menus, function (menu) {
        return {
            menuId: menu.menuId, menuName: menu.menuName, menuDescription: menu.menuDescription, groups: ko.observableArray(ko.utils.arrayMap(menu.groups, function (group) {
                return {
                    groupId: group.groupId, menuId: group.menuId, groupName: group.groupName, groupDescription: group.groupDescription, groupItems: ko.observableArray(ko.utils.arrayMap(group.groupItems, function (groupItem) {
                        return {
                            itemId: groupItem.itemId, groupId: groupItem.groupId, menuId: groupItem.menuId, title: groupItem.title, extra: groupItem.extra, exo: groupItem.exo, selects: groupItem.selects, includes: groupItem.includes, itemName: groupItem.itemName, itemDescription: groupItem.itemDescription, showItem: groupItem.showItem, itemSizes: ko.observableArray(ko.utils.arrayMap(groupItem.itemSizes, function (itemSize) {
                                return { sizeName: itemSize.sizeName, sizePrice: itemSize.sizePrice, menuId: itemSize.menuId, groupId: itemSize.groupId, itemId: itemSize.itemId, sizeId: itemSize.sizeId, sizeEnabled: itemSize.sizeEnabled };
                            }))
                        };
                    }))
                };
            }))
        };
    }));
    var menusName =$.map(menus, function (value) {
        return value.menuName;
    });
    self.menusName = ko.observableArray(menusName);
    self.selectedMenu = ko.observable("");
    self.getLive = function () {
        getLive();
    };
    self.selectedMenu = ko.observable("");
    self.hideAll = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        $('a.showHideItems').text('Show Items');
        for (var g = 0; g < groups().length; g++) {
            $('#' + g).hide();

        };
    };
    self.showAll = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        $('a.showHideItems').text('Hide Items');
        for (var g = 0; g < groups().length; g++) {
            $('#' + g).show();

        };
    };
    self.addGroup = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        var groupCount = groups().length;
        groups.push({ groupId: groupCount, menuId: this.menuId, groupName: "", groupDescription: "", groupItems: ko.observableArray() });
        var ugroups = updateIds(groups);
        groups(ugroups);
        $('.group').trigger('create');
    };
    self.removeGroup = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        groups.remove(this);
        // update ids
        var ugroups = updateIds(groups);
        groups(ugroups);
    };
    self.cloneGroup = function () {
        var menu = self.menus()[this.menuId];
        // var menuId = this.menuId;
        var groups = menu.groups;
        var groupId = menu.groups().length;
        var group = groups()[this.groupId];
        var cGroup = JSON.parse(JSON.stringify(group));
        var items = group.groupItems();
        var cItems = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var cItem = JSON.parse(JSON.stringify(item));
            cItem.groupId = groupId;
            var itemSizes = JSON.parse(JSON.stringify(item.itemSizes()));
            for (var s = 0; s < itemSizes.length; s++) {
                var size = item.itemSizes()[s];
                size.groupId = groupId;
            };
            cItem.itemSizes = ko.observableArray(itemSizes);
            cItems.push(cItem);
        };
        cGroup.groupItems = ko.observableArray(cItems);
        groups.push(cGroup);

    };
    self.moveGroupDown = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        groups().move(this.groupId, this.groupId + 1);
        var ugroups = updateIds(groups);
        groups(ugroups);
    };
    self.moveGroupUp = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        groups().move(this.groupId, this.groupId - 1);
        var ugroups = updateIds(groups);
        groups(ugroups);
    };
    self.addItem = function () {
        var amenus = self.menus();
        var menu = amenus[this.menuId];
        var groups = menu.groups;
        var group = groups()[this.groupId];
        var items  = group.groupItems;
        var itemcount = items().length;
            items.push({
                itemId: itemcount, groupId: this.groupId, menuId: this.menuId, itemName: "", title: "", selects: [], includes:[], additions: [],extra: "", ex: {}, itemDescription: "", showItem: true,
                itemSizes: ko.observableArray([{ sizeName: "", sizePrice: "", sizeId: 0, itemId: itemcount, groupId: this.groupId, menuId: this.menuId, sizeEnabled: true }])
            });
            var ugroups = updateIds(groups);
            groups(ugroups);
        $('.item').trigger('create');
    };
    self.cloneItem = function () {
        var menu = self.menus()[this.menuId];
        // var menuId = this.menuId;
        var groups = menu.groups;
        // var groupId = this.groupId;
        var group = groups()[this.groupId];
        var items = group.groupItems();
        var itemId = items.length;
        var item = items[this.itemId];        
        var cItem = JSON.parse(JSON.stringify(item)); 
        cItem.id = itemId;
        var itemSizes = JSON.parse(JSON.stringify(item.itemSizes()));
        for (var s = 0; s < itemSizes.length; s++) {
            var size = itemSizes[s];
            size.itemId = itemId;
        };
        cItem.itemSizes = ko.observableArray(itemSizes);
        group.groupItems.push(cItem);
        var ugroups = updateIds(groups);
        groups(ugroups);
        $('.item').trigger('create');

    };
    self.moveItemDown = function () {        
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        var group = groups()[this.groupId];
        var items = group.groupItems();
        items.move(this.itemId, this.itemId + 1);
        group.groupItems(items);
        var ugroups = updateIds(groups);
        groups(ugroups);
    };
    self.moveItemUp = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        var group = groups()[this.groupId];
        var items = group.groupItems();
        items.move(this.itemId, this.itemId - 1);
        group.groupItems(items);
        var ugroups = updateIds(groups);
        groups(ugroups);
    };
    self.removeItem = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        var group = groups()[this.groupId];
        var groupItems = group.groupItems;
        groupItems.remove(this);
        var ugroups = updateIds(groups);
        groups(ugroups);
    };
    self.addSize = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        var group = groups()[this.groupId];
        var groupItems = group.groupItems;
        var item = groupItems()[this.itemId];
        item.itemSizes.push({ sizeName: "", sizePrice: "", menuId: this.menuId, groupId: this.groupId, itemId: this.itemId, sizeEnabled: true });
        $('.size').trigger('create');
    };
    self.removeSize = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        var group = groups()[this.groupId];
        var groupItems = group.groupItems();
        var item = groupItems[this.itemId];
        item.itemSizes.remove(this);
        var ugroups = updateIds(groups);
        groups(ugroups);
    };
    self.preview = function () {
        var iframe = document.getElementById('ifordertaker');
        iframe.src = iframe.src;
        $('#menuPreview').popup({ positionTo: "window", overlayTheme: "b", theme: "a", dismissible: true, transition: "pop" });
        $('#menuPreview').popup("open");
        $('#menuPreview').draggable();
    };
    self.currentItem = {};
    self.popIncludes = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        var group = groups()[this.groupId];
        var items = group.groupItems();
        self.currentItem = items[this.itemId];
        if (typeof self.currentItem.includes=="undefined") self.currentItem.includes=[];
        if (typeof self.currentItem.selects=="undefined") self.currentItem.selects=[];
        var includes = self.currentItem.includes;
        if (includes.length) {
            var pIncludes = $.map(includes, function (n, i) {
                var listName = n.listName;
                var includeNames = [];
                var includePrices = [];
                var includeList = $.map(n.includeList, function (v) {
                    var includeObj = v; //JSON.parse(v);
                    includeNames.push(includeObj.include.name);
                    includePrices.push(includeObj.include.price);
                    return includeObj.include.name;
                });
                var list = $.map(self.listObject[listName], function (v) {
                    var xinclude = { "include": { "name": v, "price": "" } };
                    var s = includeNames.indexOf(v);
                    if (s >= 0) xinclude = { "include": { "name": v, "price":includePrices[s] } };
                    return xinclude;
                });
                return {
                    listName: listName,
                    list: ko.observableArray(list),
                    includeList: ko.observableArray(includeList),
                    includeSelected: ko.observableArray(includes[i].includeSelected)
                };
            });
            self.includes(pIncludes);
        } else self.includes([]);
        $('#includesDialogPage').popup({ positionTo: "window", overlayTheme: "b", theme: "a", dismissible: true, transition: "pop" });
        $('#includesDialogPage').popup("open");
        $('#includesDialogPage').draggable();
       
        for (var i = 0; i < self.includes().length; i++) {
            var include = self.includes()[i];
            include.includeList.push("");
            include.includeList.pop();
            include.includeSelected.push("");
            include.includeSelected.pop();
        };
    };
    self.includeSave = function () {
        var includes = self.includes();
        self.currentItem.includes = $.map(includes, function (n) {
            var includeSelected = n.includeSelected();
            var includeName = n.listName;
            var listNames = [];
            var listPrices = [];
            $.map(n.list(), function (v) {
                listNames.push(v.include.name);
                listPrices.push(v.include.price);
                return;
            });
            //var includeSelected = $.map(n.includeSelected(), function(val, index){
            //    return { "include": {"name" : val.option.name, "price" : val.option.price() }}
            //});
            //var includeList = n.includeList();
            var includeList = $.map(n.includeList(), function (v) {
                var include = { "include": { "name": v, "price": "" } };
                var s = listNames.indexOf(v);
                if (s >= 0) include = { "include": { "name": v, "price": $('#' + (includeName + v).replace(/ /g, '')).val() } };
                return include;
            });
            return { "listName": n.listName, "includeList": includeList, "includeSelected": includeSelected };
        });
        $('#includesDialogPage').popup("close");
        self.save();
    };
    self.popSelects = function () {
        var menu = self.menus()[this.menuId];
        var groups = menu.groups;
        var group = groups()[this.groupId];
        var items = group.groupItems();
        self.currentItem = items[this.itemId];
        if (typeof self.currentItem.includes=="undefined") self.currentItem.includes=[];
        if (typeof self.currentItem.selects=="undefined") self.currentItem.selects=[];        
        var selects = self.currentItem.selects;
        if (selects.length) {
            var pSelects = $.map(selects, function (n) {
                var xlists = self.listObject[n.sourceName];
                if (typeof n.selectDefault =="undefined" ) n.selectDefault="";
                var selectDefault = JSON.stringify(n.selectDefault.option);
                var noptions = n.options;
                var selectList = $.map(noptions, function (val) {
                    return val.option.name;
                });
                var prices = $.map(noptions, function (val) {
                    return val.option.price;
                });
                var options = $.map(xlists, function (val) {
                    var option = {"option" : { "name": val, "price": "" }};
                    var s = selectList.indexOf(val);
                    if (s >= 0) option = { "option": { "name": selectList[s], "price": prices[s] } };
                    return option;
                });
                return { selectName: n.selectName, selectDefault: selectDefault, sourceName: n.sourceName, options: ko.observableArray(options), selectList: ko.observableArray(selectList) };
            });
            self.selects(pSelects);
        };
        $('#selectsDialogPage').popup({ positionTo: "window", overlayTheme: "b", theme: "a", dismissible: true, transition: "pop" });
        $('#selectsDialogPage').popup("open");
        $('#selectsDialogPage').draggable();

        for (var i = 0; i < self.selects().length; i++) {
            var select = self.selects()[i];
            select.selectList.push("");
            select.selectList.pop();
        };
    };
    self.selectsSave = function () {
        var selects = $.map(self.selects(), function (n) {
            var selectDefault = {"option" : JSON.parse(n.selectDefault) } ;
            var selectList = n.selectList();
            var noptions = n.options();
            var options = $.map(noptions, function (val) {
                if (selectList.indexOf(val.option.name) >= 0)
                    return { option: { "name": val.option.name, "price": val.option.price } };
            });

            return { "sourceName": n.sourceName, "selectName": n.selectName, "selectDefault": selectDefault, "options": options };
        });
        self.currentItem.selects = selects;
        $('#selectsDialogPage').popup("close");
        self.save();
    };
    self.getMenus = function () {
        var menus = localStorage.getItem(vendor.phone + '-menus');
        if (!menus) menus = [];
    };
    self.save = function () {
        var menusString = JSON.stringify(ko.toJS(self.menus));
        $.post("/savevendormenu", { vendorPhone: vendor.phone, menus: menusString });
    };
    self.saveLists = function () {
        var listsString = JSON.stringify(ko.toJS(self.lists));
        $.post("/savevendorlists", { vendorPhone: vendor.phone, lists: listsString });
         $('#popupList').popup("close");
    };
    self.includeSelected = ko.observableArray();
    self.includeDefaults = ko.observableArray();
    //var includedata = [{ "listName": "veggies", "list": ["Lettuce", "Spinach", "Cabbage", "Onion", "Tomato", "Cucumber", "Green Peppers", "Red Peppers", "Yellow Peppers", "Banana peppers", "Jalepenos", "Bean sprouts", "Alfalfa Sprouts", "Pickles", "Green Olives", "Black Olives", "Sliced mushrooms"] }, { "listName": "condiment", "list": ["Salt","Black Pepper","Mayo", "Miracle whip", "Yellow Mustard", "Spicy Mustard", "Dijon Mustard", "Ranch dressing", "Italian dressing", "Ceaser dressing", "Salsa", "Hot sauce"] }];
    //self.includes = ko.observableArray(ko.utils.arrayMap(includedata, function (include) {
     //   return { listName: include.listName, list: ko.observableArray(include.list), includeList: ko.observableArray(), includeSelected: ko.observableArray() }
    //}));
};
function getLive() {
    $.get('/vendor/' + vendor.phone + '/lists.js',
        function (data) {
            var lists = JSON.parse(data);
            $.get('/vendor/' + vendor.phone + '/groups.js',
            function (listdata) {
                var menus = new Menu(JSON.parse(listdata), lists);
                ko.applyBindings(menus);
            updateBindings();

        });
        });
};
$(document).ready(function () {
    var url = "/orderfrom/" + vendor.phone;
    $('#ifordertaker').attr("src", url);
    getLive();
    
});


