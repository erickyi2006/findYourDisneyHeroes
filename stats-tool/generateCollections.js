// SOURCE: https://wakkatu.github.io/dhero/en/hero_list.htm
var fs = require('fs');
var Path = require('path');
var async = require('async');
var moment = require('moment');
var EOL = require('os').EOL;
var _ = require('lodash');
var ROLES = require("./input/lookupRoles.json");
var FRIENDS = require("./input/lookupFriendships.json");

const PRINT_OUTPUT = "matching [MATCH_COUNT]. found: [MATCHED]/[TOTAL]";
const OUTPUT_FOLDER = "output/";
const LIMIT = 120;
var COLLECTION_FILE = "./input/collections.csv";
if (process.argv.length >= 3) {
    COLLECTION_FILE = process.argv[2];
};


function saveJsonSync(filename, jsonRequest, isPretty) {
    var body = JSON.stringify(jsonRequest); // do not beautify
    if (isPretty) {
        body = JSON.stringify(jsonRequest, null, 2); // beautify
    }
    fs.writeFileSync(filename, body);
};

function dictionaryToArray(lookup) {
    var array = [];
    for (var key in lookup) {
        var value = lookup[key];
        array.push(value);
    }
    return array;
}

function loadCollection(filename, cb) {
    var result = {
        collections: {}
    };
    var lookup = {};
    fs.readFile(filename, function (err, data) {
        if (err) {
            console.error("failed to load", filename);
            return cb(err);
        }
        else {
            var contents = "" + data;
            var lines = contents.split("\n");
            var line = lines[0];
            var lineIdx = 1; // skip the headers
            for (; lineIdx < lines.length; lineIdx++) {
                var heroes = [];
                line = lines[lineIdx];
                line = line.replace("\r", "");
                if (line.length > 0) {
                    var tokens = line.split(",");
                    if (tokens) {
                        var collectionName = tokens[0];
                        for (var tokenIdx = 2; // skip the total
                            tokenIdx < tokens.length; tokenIdx++) {
                            var token = tokens[tokenIdx];
                            if (token !== '') {
                                heroes.push(token);
                            }
                        }
                    }
                    result.collections[collectionName] = heroes;
                }
            }
        }
        return cb(null, result);
    });
}

async.waterfall(
    [
        function (cb) {
            loadCollection(COLLECTION_FILE, function(err, result){
                console.log("collection ---");
                var isPretty = false;
                var filename = OUTPUT_FOLDER + "collections.json";
                saveJsonSync(filename, result.collections, isPretty);
                return cb(null);
            });
        }
    ],
    function (err, results) {
        console.error("done");
    }
);
