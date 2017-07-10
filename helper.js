var parseString = require('xml2js').parseString;
var fs = require('fs');
var async = require('async');
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

exports.comparePackageChanges = function(data, cb){
    var me = this;

    var packageKeys = {};

    async.parallel({
        one: function (callback) {
            me.readFile(data.inputFileOne, function (error, response) {
                if (error) {
                    callback(true);
                } else {
                    response = JSON.parse(response);
                    callback(null, response);
                }
            });
            
        },
        two: function (callback) {
            me.readFile(data.inputFileTwo, function (error, response) {
                if (error) {
                    callback(true);
                } else {
                    response = JSON.parse(response);
                    callback(null, response);
                }
            });
            
        },
    }, function (error, results) {
        if(error){
            console.log(error);
        } else {
            var packages = results.one;
            var codes = results.two;

            for(var package in packages){            
                for(var packageKey in packages[package]){                

                    var tempComparePackageKey = packageKey.replace(/\\/gi, '');

                    for(var code in codes){
                        var tempCodeKey = code.replace(/\\/gi, '');

                        if(tempCodeKey.indexOf(tempComparePackageKey) >= 0){

                            if(typeof packageKeys[packageKey] === 'undefined'){
                                packageKeys[packageKey] = {};
                                packageKeys[packageKey].changes = 0;
                            }

                            var _tempValue = parseInt((packageKeys[packageKey]).changes);
                            var _tempCurrentCodeValue = parseInt((codes[code]).changes);

                            if(_tempCurrentCodeValue){
                                _tempValue = _tempValue + _tempCurrentCodeValue;    
                            }

                            packageKeys[packageKey].changes = _tempValue;

                        }
                    }                
                }            
            } 
            cb('',packageKeys);
        }
    })
}

//Process diff comparison
exports.processDiff = function (data, config, cb) {

    if (data.length > 0) {
        var output = {};
        data.forEach(function (diffLine) {

            var diffContent = diffLine.toString().split('|');

            if (diffContent.length == 2) {

                //var _file = (diffContent[0]).trim().toString();                
                var _file = ((diffContent[0]).trim().toString()).replace(/(\/)/g,'\\');
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
                    //output[_file].insertions = _count;
                    output[_file].changes = _count;
                } else if (_change.indexOf('-') >= 0) {
                    output[_file] = {};
                    //output[_file].deletions = _count;
                    output[_file].changes = _count;
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
