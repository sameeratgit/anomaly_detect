var helper = require("./helper.js");

exports.getPackageData = function (cb) {
    helper.parseXml(function (error, data) {
        if (error) {
            cb(error);
        } else {
            if (data) {
                var packageArray = data.dependencies.package;
                cb(null, packageArray);
            } else {
                cb(true);
            }
        }
    })
}