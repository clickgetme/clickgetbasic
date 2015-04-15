module.exports = function (config, mongoose, nodemailer) {

    var Order = new mongoose.Schema({
        from: { type: mongoose.Schema.ObjectId },
        to: { type: mongoose.Schema.ObjectId },
        orderItems: [{}]
    });



}