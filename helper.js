var parseString = require('xml2js').parseString;
var fs = require('fs');
var path = require('path');
var xmlFilePath = 'pdepend_dep.xml';

//Parsing XML to JSON
exports.parseXml = function (cb) {
    fs.readFile(path.join(__dirname, xmlFilePath), {
        encoding: 'utf-8'
    }, function (err, xml) {
        if (!err) {
            parseString(xml, function (err, data) {
                if (data) {
                    cb(null, data);
                } else {
                    cb(err);
                }
            });
        } else {
            cb(err);
        }
    });
}