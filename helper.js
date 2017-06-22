var parseString = require('xml2js').parseString;
var fs = require('fs');
var path = require('path');

//Parsing XML to JSON
exports.parseXml = function (xmlFilePath, cb) {
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

//Save data to file
exports.saveToFile = function (data, cb) {
    fs.writeFile(data.outputFile, JSON.stringify(data.output), function (error) {
        if (error) {
            cb(error);
        } else {
            cb(null, true);
        }
    });
}