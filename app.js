var core = require("./core.js");
var helper = require("./helper.js");
var async = require("async");

//XML Output from PHPDepend
var xmlFilePath = 'pdepend_dep.xml';

//Output file name
var outputFile = 'output.json';

//Process Queue
var queue = async.queue(function (data, callback) {

    var packageClassListItem = data.packageClassListItem;
    var packageData = data.packageData;

    var _basePackage = packageClassListItem.packageName;
    var _baseClass = packageClassListItem.className;

    var _output = {};

    var _baseName = _basePackage + ':' + _baseClass;

    _output[_baseName] = {};

    packageData.forEach(function (packageItem) {

        var packageName = packageItem.$.name;

        //Scanning all classes inside the package.
        if (packageItem.class) {
            var packageClass = packageItem.class;

            packageClass.forEach(function (classItem) {

                var className = classItem.$.name;
                var _currentName = packageName + ':' + className;

                _output[_baseName][_currentName] = {};

                var efferentTypes = classItem.efferent[0].type;
                if (efferentTypes) {
                    efferentTypes.forEach(function (efferentTypeItem) {
                        var _effNamespace = efferentTypeItem.$.namespace;
                        var _effName = efferentTypeItem.$.name;
                        if (_basePackage == _effNamespace && _baseClass == _effName) {
                            _output[_baseName][_currentName].efferent = 1;
                        }
                    });
                }

                var afferentTypes = classItem.afferent[0].type;
                if (afferentTypes) {
                    afferentTypes.forEach(function (afferentTypeItem) {
                        var _affNamespace = afferentTypeItem.$.namespace;
                        var _affName = afferentTypeItem.$.name;
                        if (_basePackage == _affNamespace && _baseClass == _affName) {
                            _output[_baseName][_currentName].afferent = 1;
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

                _output[_baseName][_currentName] = {};

                var efferentTypes = classItem.efferent[0].type;
                if (efferentTypes) {
                    efferentTypes.forEach(function (efferentTypeItem) {
                        var _effNamespace = efferentTypeItem.$.namespace;
                        var _effName = efferentTypeItem.$.name;
                        if (_basePackage == _effNamespace && _baseClass == _effName) {
                            _output[_baseName][_currentName].efferent = 1;
                        }
                    });
                }

                var afferentTypes = classItem.afferent[0].type;
                if (afferentTypes) {
                    afferentTypes.forEach(function (afferentTypeItem) {
                        var _affNamespace = afferentTypeItem.$.namespace;
                        var _affName = afferentTypeItem.$.name;
                        if (_basePackage == _affNamespace && _baseClass == _affName) {
                            _output[_baseName][_currentName].afferent = 1;
                        }
                    });
                }
            });
        }

    });

    callback(null, _output);
}, 10);

/**
 * After processing all queue. 
 */
queue.drain = function () {
    var data = {
        outputFile: outputFile,
        output: output
    }

    helper.saveToFile(data, function (error, data) {
        if (error) {
            console.log(error);
        } else {
            console.log("Processing completed");
            console.log("Output saved to " + outputFile);
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