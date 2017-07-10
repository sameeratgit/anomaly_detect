var fs = require("fs");
var helper = require("./helper.js");
var inputFileOne = 'output.json';
var inputFileTwo = 'git-diff-sample-output.json';
var outputFile = 'file-changes.json';

/**
 * It all starts here.
 */

var data = {
    inputFileOne: inputFileOne,
    inputFileTwo: inputFileTwo
}

helper.comparePackageChanges(data, function (error, response) {    

    var data = {
        outputFile: outputFile,
        output: response
    }

    helper.saveToFile(data, function (error, data) {
        if (error) {
            console.log(error);
        } else {            
            console.log("Processing completed");
            console.log("Output saved to " + outputFile);
        }
    });
});