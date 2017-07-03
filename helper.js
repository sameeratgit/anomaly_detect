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

//Read file for git diff.
exports.readFile = function (inputFile, cb) {
    if (inputFile) {
        fs.readFile(inputFile, function (error, fileContent) {
            if (error) {
                cb(error);
            } else {
                var diffs = fileContent.toString().split('\n');
                cb(null, diffs);
            }
        });
    } else {
        cb(true);
    }
}

//Process diff comparison
exports.processDiff = function (data, config, cb) {

    if (data.length > 0) {
        var output = {};
        data.forEach(function (diffLine) {

            var diffContent = diffLine.toString().split('|');

            if (diffContent.length == 2) {

                var _file = (diffContent[0]).trim().toString();
                var _change = (diffContent[1]).trim().toString();
                var _count = (diffContent[1]).trim().replace(/\D+/g, '');
                
                if (_change.indexOf('->') >= 0) {
                    if(config.needFileChange == true){
                        output[_file] = {};
                        output[_file].changes = 1;
                    }
                } else if (_change.indexOf('+-') >= 0) {
                    output[_file] = {};
                    output[_file].changes = _count;
                } else if (_change.indexOf('+') >= 0) {
                    output[_file] = {};
                    output[_file].insertions = _count;
                } else if (_change.indexOf('-') >= 0) {
                    output[_file] = {};
                    output[_file].deletions = _count;
                } else {
                    output[_file] = {};
                    output[_file].changes = _count;
                }

            }
        })
        cb(null, output);
    } else {
        cb(true);
    }
}