var core = require("./core.js");
var helper = require("./helper.js");
var async = require("async");

var express = require('express');
var serveStatic = require('serve-static');

var app = express();

//XML Output from PHPDepend
var xmlFilePath = 'pdepend_dep.xml';

//Output File Path
var outputPath = './public/data';

//Output file name
var outputFile = './public/data/output.json';

app.use(serveStatic('public', {
    'index': ['default.html', 'default.htm', 'view.html']
}));
app.use(serveStatic('public/assets'));
app.use(serveStatic('public/data'));

//Process Queue
var queue = async.queue(function (data, callback) {

    var packageClassListItem = data.packageClassListItem;
    var packageData = data.packageData;

    var _basePackage = packageClassListItem.packageName;
    var _baseClass = packageClassListItem.className;

    var _output_class = {};
    var _output_pkg = {};

    var _baseName_class = _basePackage + ':' + _baseClass;

    _output_class[_baseName_class] = {};
    _output_pkg[_basePackage] = {};

    packageData.forEach(function (packageItem) {

        var packageName = packageItem.$.name;

        //Scanning all classes inside the package.
        if (packageItem.class) {
            var packageClass = packageItem.class;

            packageClass.forEach(function (classItem) {

                var className = classItem.$.name;
                var _currentName = packageName + ':' + className;

                _output_class[_baseName_class][_currentName] = {};
                _output_pkg[_basePackage][packageName] = {};

                var efferentTypes = classItem.efferent[0].type;
                if (efferentTypes) {
                    efferentTypes.forEach(function (efferentTypeItem) {
                        var _effNamespace = efferentTypeItem.$.namespace;
                        var _effName = efferentTypeItem.$.name;
                        if (_basePackage == _effNamespace && _baseClass == _effName) {
                            _output_class[_baseName_class][_currentName].efferent = 1;
                            _output_pkg[_basePackage][packageName].efferent = _output_pkg[_basePackage][packageName].efferent ? _output_pkg[_basePackage][packageName].efferent + 1 : 1;
                        }
                    });
                }

                var afferentTypes = classItem.afferent[0].type;
                if (afferentTypes) {
                    afferentTypes.forEach(function (afferentTypeItem) {
                        var _affNamespace = afferentTypeItem.$.namespace;
                        var _affName = afferentTypeItem.$.name;
                        if (_basePackage == _affNamespace && _baseClass == _affName) {
                            _output_class[_baseName_class].afferent = 1;
                            _output_pkg[_basePackage][packageName].afferent = _output_pkg[_basePackage][packageName].afferent ? _output_pkg[_basePackage][packageName].afferent + 1 : 1;
                        }
                    });
                }
            });
        }

        //Scanning all interfaces inside the package.
        if (packageItem.interface) {
            var packageInterface = packageItem.interface;

            packageInterface.forEach(function (classItem) {

                var className = classItem.$.name;
                var _currentName = packageName + ':' + className;

                _output_class[_baseName_class][_currentName] = {};
                _output_pkg[_basePackage][packageName] = {};

                var efferentTypes = classItem.efferent[0].type;
                if (efferentTypes) {
                    efferentTypes.forEach(function (efferentTypeItem) {
                        var _effNamespace = efferentTypeItem.$.namespace;
                        var _effName = efferentTypeItem.$.name;
                        if (_basePackage == _effNamespace && _baseClass == _effName) {
                            _output_class[_baseName_class][_currentName].efferent = 1;
                            _output_pkg[_basePackage][packageName].efferent = _output_pkg[_basePackage][packageName].efferent ? _output_pkg[_basePackage][packageName].efferent + 1 : 1;

                        }
                    });
                }

                var afferentTypes = classItem.afferent[0].type;
                if (afferentTypes) {
                    afferentTypes.forEach(function (afferentTypeItem) {
                        var _affNamespace = afferentTypeItem.$.namespace;
                        var _affName = afferentTypeItem.$.name;
                        if (_basePackage == _affNamespace && _baseClass == _affName) {
                            _output_class[_baseName_class][_currentName].afferent = 1;
                            _output_pkg[_basePackage][packageName].afferent = _output_pkg[_basePackage][packageName].afferent ? _output_pkg[_basePackage][packageName].afferent + 1 : 1;

                        }
                    });
                }
            });
        }

    });
    var _output = _output_pkg;

    callback(null, _output);
}, 10);

/**
 * After processing all queue. 
 */
queue.drain = function () {
    var data = {
        outputFile: outputFile,
        output: output
    };

    helper.saveToFile(data, function (error, status) {
        if (error) {
            console.log(error);
        } else {
            console.log("Processing completed");
            console.log("Output saved to " + data.outputFile);
        }
    });
};

var output = [];

/**
 * It all starts here.
 */
core.getPackageData(xmlFilePath, function (error, packageData) {

    if (error) {
        console.log(error);
    } else {

        var _packageClassList = [];

        //Identifies all packages and classes
        packageData.forEach(function (packageItem) {
            if (packageItem.$.name) {
                var packageName = packageItem.$.name;

                //Get all classes
                if (packageItem.class) {
                    var packageClass = packageItem.class;
                    packageClass.forEach(function (classItem) {
                        if (classItem.$.name) {
                            var className = classItem.$.name;
                            _packageClassList.push({
                                packageName: packageName,
                                className: className
                            });
                        }
                    });
                }

                //Get all interfaces
                if (packageItem.interface) {
                    var packageClass = packageItem.interface;
                    packageClass.forEach(function (classItem) {
                        if (classItem.$.name) {
                            var className = classItem.$.name;
                            _packageClassList.push({
                                packageName: packageName,
                                className: className
                            });
                        }
                    });
                }
            }
        });

        //Process each package
        _packageClassList.forEach(function (packageClassListItem) {
            if (packageClassListItem) {
                queue.push({
                    packageData: packageData,
                    packageClassListItem: packageClassListItem
                }, function (error, data) {
                    if (error) {
                        console.log(err);
                    } else {
                        if (data) {
                            output.push(data);
                        }
                    }
                });
            }
        });
    }
});

app.listen(3000);