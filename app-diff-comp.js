var fs = require("fs");
var helper = require("./helper.js");

var inputFile = './public/data/tiki_diff_14-0_15-0.txt';
var outputFile = './public/data/tiki_diff_14-0_15-0.json';

var config = {
    needFileChange: true, //Whether the output needs file additions and removals.
    dependFile: './public/data/output_tiki_v15.json'
}

/**
 * It all starts here.
 */
helper.readFile(inputFile, function (error, diffs) {
    if (error) {
        console.log(error);
    } else {
        helper.processDiff(diffs, config, function (error, diffOutput) {

            var data = {
                outputFile: outputFile,
                output: diffOutput
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
    }
});