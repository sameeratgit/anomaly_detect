var core = require("./core.js");
var helper = require("./helper.js");
var async = require("async");

//XML Output from PHPDepend
var xmlFilePath = 'sample_input.xml';

//Output file name
var outputFile = 'output.json';

//Need class comparison ? (true/false)
const NEED_CLASS_COMPARISON = false;

if (NEED_CLASS_COMPARISON) {

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

            //Process class/interface
            function processItem(classItem) {
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
            }

            //Scanning all classes inside the package.
            if (packageItem.class) {
                packageItem.class.forEach(function (classItem) {
                    processItem(classItem);
                });
            }

            //Scanning all interfaces inside the package.
            if (packageItem.interface) {
                packageItem.interface.forEach(function (classItem) {
                    processItem(classItem);
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
} else {

    //Process Queue
    var queue = async.queue(function (data, callback) {

        var _basePackage = data.dataPackage;
        var _baseClass = data.dataClass;
        var _packageData = data.packageData;

        var _output = {};

        var _baseName = _basePackage;

        _output[_baseName] = {};

        _packageData.forEach(function (packageItem) {

            var packageName = packageItem.$.name;

            //Scanning all classes inside the package.
            if (packageItem.class) {
                packageItem.class.forEach(function (classItem) {
                    processItem(classItem);
                });
            }

            //Scanning all interfaces inside the package.
            if (packageItem.interface) {
                packageItem.interface.forEach(function (classItem) {
                    processItem(classItem);
                });
            }

            //Process class/interface
            function processItem(classItem) {
                var className = classItem.$.name;
                var _currentName = packageName + ':' + className;

                _output[_baseName][packageName] = {};

                var efferentTypes = classItem.efferent[0].type;
                if (efferentTypes) {
                    efferentTypes.forEach(function (efferentTypeItem) {
                        var _effNamespace = efferentTypeItem.$.namespace;
                        if (_basePackage == _effNamespace) {
                            if (typeof _output[_baseName][packageName].efferent == 'undefined') {
                                _output[_baseName][packageName] = {};
                                _output[_baseName][packageName].efferent = 0;
                            }
                            (_output[_baseName][packageName].efferent) ++;
                        }
                    });
                }

                var afferentTypes = classItem.afferent[0].type;
                if (afferentTypes) {
                    afferentTypes.forEach(function (afferentTypeItem) {
                        var _affNamespace = afferentTypeItem.$.namespace;
                        if (_basePackage == _affNamespace) {
                            if (typeof _output[_baseName][packageName].afferent == 'undefined') {
                                _output[_baseName][packageName] = {};
                                _output[_baseName][packageName].afferent = 0;
                            }
                            (_output[_baseName][packageName].afferent) ++;
                        }
                    });
                }
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
                                if (typeof _packageClassList[packageName] === 'undefined') {
                                    _packageClassList[packageName] = [];
                                }
                                _packageClassList[packageName].push(className);
                            }
                        });
                    }

                    //Get all interfaces
                    if (packageItem.interface) {
                        var packageClass = packageItem.interface;
                        packageClass.forEach(function (classItem) {
                            if (classItem.$.name) {
                                var className = classItem.$.name;
                                if (typeof _packageClassList[packageName] === 'undefined') {
                                    _packageClassList[packageName] = [];
                                }
                                _packageClassList[packageName].push(className);
                            }
                        });
                    }
                }
            });

            //Process each package        
            for (var key in _packageClassList) {
                queue.push({
                    dataPackage: key,
                    dataClass: _packageClassList[key],
                    packageData: packageData
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
        }
    });
}