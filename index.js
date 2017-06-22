var core = require("./core.js");

core.getPackageData(function (error, packageData) {

    if (error) {
        console.log(error);
    } else {

        var _packageClassList = [];

        packageData.forEach(function (packageItem) {
            if (packageItem.$.name) {
                var packageName = packageItem.$.name;

                var packageClass = packageItem.class || packageItem.interface;
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
        });

        var _output = [];

        _packageClassList.every(function (packageClassListItem) {

            var _basePackage = packageClassListItem.packageName;
            var _baseClass = packageClassListItem.className;

            _output[_basePackage + ':' + _baseClass] = [];

            packageData.forEach(function (packageItem) {

                var packageName = packageItem.$.name;

                var packageClass = packageItem.class || packageItem.interface;
                packageClass.forEach(function (classItem) {

                    var className = classItem.$.name;

                    _output[_basePackage + ':' + _baseClass][packageName + ':' + className] = {};

                    var efferentTypes = classItem.efferent[0].type;
                    efferentTypes.forEach(function (efferentTypeItem) {

                        var _effNamespace = efferentTypeItem.$.namespace;
                        var _effName = efferentTypeItem.$.name;

                        if (_effNamespace == _basePackage && _effName == _baseClass) {
                            _output[_basePackage + ':' + _baseClass][packageName + ':' + className].efferent = 1;
                        } else {
                            if (!_output[_basePackage + ':' + _baseClass][packageName + ':' + className].afferent) {
                                _output[_basePackage + ':' + _baseClass][packageName + ':' + className].afferent = 0;
                            }
                        }

                    });

                    var afferentTypes = classItem.afferent[0].type;
                    afferentTypes.forEach(function (afferentTypeItem) {

                        var _affNamespace = afferentTypeItem.$.namespace;
                        var _affName = afferentTypeItem.$.name;

                        if (_affNamespace == _basePackage && _affName == _baseClass) {
                            _output[_basePackage + ':' + _baseClass][packageName + ':' + className].afferent = 1;
                        } else {
                            if (!_output[_basePackage + ':' + _baseClass][packageName + ':' + className].efferent) {
                                _output[_basePackage + ':' + _baseClass][packageName + ':' + className].efferent = 0;
                            }
                        }
                    });
                });
            });
        });
        console.log(_output);
    }
});