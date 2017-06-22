var helper = require("./helper.js");

exports.getPackageData = function (inputFile, cb) {
    helper.parseXml(inputFile, function (error, data) {
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