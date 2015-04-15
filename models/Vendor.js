module.exports = function (mongoose) {
    var crypto = require('crypto');
    var schemaOptions = {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    };

    var VendorSchema = new mongoose.Schema({
        name: { type: String },
        phone: { type: String },
        email: { type: String },
        fax: { type: String },
        localityName: { type: String },
        postalCode: { type: String },
        regionName: { type: String },
        postalCode: { type: String },
        regionName: { type: String },
        streetAddress: { type: String },
        countryName: { type: String },
        userId: { type: mongoose.Schema.ObjectId },
        users:[{ type: mongoose.Schema.ObjectId }],
        customers: [{ type: mongoose.Schema.ObjectId }]
    }, schemaOptions);

`
    var registerCallback = function (err) {
        if (err) {
            return console.log(err);
        };
        return console.log('User was created');
    };

    var Vendor = mongoose.model('Vendor', VendorSchema);

    var findVendorId = function (phone, callback) {
        Vendor.findOne({'phone': phone }, '_id', function (err, doc) { callback(doc) });
    };

    var findVendor = function (vendorId, callback) {
        Vendor.findOne({ '_id': vendorId }, function (err, doc) { callback(doc) });
    };

    var findVendorMenuById = function (vendorId, callback) {
        Vendor.findOne({ _id: vendorId }, 'menus', function (err, doc) {
            callback(doc);
        });
    };

    var findVendorMenus = function (phone, callback) {

        Vendor.findOne({ 'phone': phone }, 'menus', function (err, doc) {
            console.log('doc:' + doc);
            console.log('err:' + err);
            callback(doc)
        });
    };

    var registerVendor = function (name, email, password, phone, countryName, localityName, postalCode, regionName, streetAddress, fax) {
        var shaSum = crypto.createHash('sha256');
        shaSum.update(password);

        console.log('Registering vendor ' + name);
        var vendor = new Vendor({
            name: name,
            email: email,
            password: shaSum.digest('hex'),
            phone: phone,
            countryName: countryName,
            localityName: localityName,
            postalCode: postalCode,
            regionName: regionName,
            streetAddress: streetAddress,
            fax:fax          
        });
        vendor.save(registerCallback);
        console.log('Vendor was  sent');
    };

    return {
        Vendor: Vendor,
        findVendorId: findVendorId,
        findVendorMenuById: findVendorMenuById,
        findVendorMenus: findVendorMenus,
        registerVendor: registerVendor
    }
}
