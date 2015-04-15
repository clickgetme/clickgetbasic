module.exports = function (mongoose) {
    var schemaOptions = {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
    };

    var ItemSchema = new mongoose.Schema({
        item: { type: String },
        price: { type: String },
        description: { type: String },
        itemOptions: [{}]
    }, schemaOptions);

    var GroupSchema = new mongoose.Schema({
        group: { type: String },
        items: [ItemSchema]
    }, schemaOptions);

    var MenuSchema = new mongoose.Schema({
        name: { type: String },
        phone: { type: String },
        groups: [GroupSchema]
    }, schemaOptions);

    var Menu = mongoose.model('Menu', MenuSchema);
    var Group = mongoose.model('Group', GroupSchema);
    var Item = mongoose.model('Item', ItemSchema);

    var createMenuCallback = function (err) {
        if (err) {
            return console.log(err);
        };
        return console.log('Menus was saved');
    };

    var createMenu = function (menu) {

        console.log('saving menu ');
        var menu = new Menu(menu);
        menu.save(createMenuCallback);
        console.log('Save menu was sent');
    };
    var getMenuById = function (menuId, callback) {
        Menu.findOne({ '_id': menuId }, function (err, doc) {
            callback(doc);
        });
    };

    var addGroup = function (menuId, group) {
        Menu.update({ _id: menuId }, { $push: {groups: group}})
    };

    var addItem = function (groupId, item) {
        Menu.update({ 'groups._id': groupId, }, { $push: {items:item}})

    }

    var findMenu = function (phone, callback) {

        Menu.find({ 'phone': phone }, function (err, doc) {

            callback(doc)
        });
    };

    var getMenu = function (phone, callback) {
        Menu.findOne({ phone: phone }, function (err, doc) {
            callback(doc);
        });
    };
    return {
        Menu: Menu, Group:Group, Item:Item, findMenu: findMenu, createMenu: createMenu, addGroup: addGroup, addItem: addItem
    }
}

//var registerVendor = function (name, email, password, phone, countryName, localityName, postalCode, regionName, streetAddress, fax) {
//    var shaSum = crypto.createHash('sha256');
//    shaSum.update(password);

//    console.log('Registering vendor ' + name);
//    var vendor = new Vendor({
//        name: name,
//        email: email,
//        password: shaSum.digest('hex'),
//        phone: phone,
//        countryName: countryName,
//        localityName: localityName,
//        postalCode: postalCode,
//        regionName: regionName,
//        streetAddress: streetAddress,
//        fax: fax
//    });
//    vendor.save(registerCallback);
//    console.log('Vendor was  sent');
//};

//code in  User
//var changePassword = function (userId, newpassword) {
//    var shaSum = crypto.createHash('sha256');
//    shaSum.update(newpassword);
//    var hashedPassword = shaSum.digest('hex');
//    User.update({ _id: UserId }, { $set: { password: hashedPassword } }, { upsert: false },
//      function changePasswordCallback(err) {
//          console.log('Change password done for user ' + userId);
//      });
//};