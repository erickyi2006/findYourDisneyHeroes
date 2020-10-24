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
var FILE = "./input/heroes.csv";
var COLLECTION_FILE = "./input/collections.csv";
if (process.argv.length >= 3) {
    FILE = process.argv[2];
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

function loadHeroes(filename, cb) {
    var result = {
        data: [],
        heroes: [],
        lookupFriendship: {},
        lookupHeroes: {}
    };
    var lookup = {};
    var heroes = [];
    fs.readFile(filename, function (err, data) {
        if (err) {
            console.error("failed to load", filename);
            return cb(err);
        }
        else {
            var contents = "" + data;
            var lines = contents.split("\n");
            // get the hero names
            var line = lines[0];
            line = line.replace("\r", "");
            var tokens = line.split(",");
            for (var tokenIdx = 0; // maintain the index - we need [0]
                tokenIdx < tokens.length; tokenIdx++) {
                var token = tokens[tokenIdx];
                heroes.push(token);
            }

            var lineIdx = 2; // skip the headers
            for (; lineIdx < lines.length; lineIdx++) {
                var heroLine = "";
                line = lines[lineIdx];
                line = line.replace("\r", "");
                if (line.length > 0) {
                    var tokens = line.split(",");
                    if (tokens) {
                        // Date,Player,Alice,Aladdin,Anger,Animal,Barbossa,Baymax,Beast,Bo.Peep,Buzz,Calhoun,Colette,Dark.Wing,Dash,Donald,Ducky.Bunny,Duke.Caboom,Elasticgirl,Elsa,Eve,Facilier,Felix,Finnick,Flynn,Flynn.Rider,Frozone,Gaston,Genie,Gizmo,Gonzo,Goofy,Hades,Hercules,Hiro,Hook,Huey.D.L,Jack.Jack,Jack.Sparrow,Jafar,Jasmine,Joy,Judy.Hopps,Launchpad,Linguini,Madam.Mim,Mad.Hatter,Magica,Maleficent,Megara,Megavolt,Merida,Merlin,Mickey,Miguel,Mike,Miss.Piggy,Moana,Mr.Incredible,Nick.Wilde,Olaf,Oogie,Peter.Pan,Powerline,Quorra,Rafiki,Randall,Rapunzel,Rex,Robin.Hood,Scar,Scrooge,Shank,Simba.Nala,Stitch,Sulley,Tia.Dalma,Timon.Pumbaa,Ursula,Violet,WallE,Woody,Yax,Yzma,Zurg
                        for (var tokenIdx = 2; // skip the player
                            tokenIdx < tokens.length; tokenIdx++) {
                            var token = tokens[tokenIdx];
                            if (!_.isEmpty(token)) {
                                var hero = heroes[tokenIdx];
                                var friendship = hero + "." + token;
                                if (!result.lookupFriendship[friendship]) {
                                    var friend = "";
                                    if (FRIENDS[friendship]) {
                                        friend = FRIENDS[friendship];
                                    }
                                    else {
                                        console.error("ERROR: friendship not found", friendship);
                                    }
                                    result.lookupFriendship[friendship] = {
                                        hero: hero,
                                        friend: friend,
                                        total: 1
                                    };
                                }
                                else {
                                    var friendshipItem = result.lookupFriendship[friendship];
                                    friendshipItem.total = friendshipItem.total + 1;
                                }
                                heroLine += hero + ",";
                                if (!lookup[hero]) {
                                    lookup[hero] = true;
                                    result.lookupHeroes[hero] = 1;
                                    result.heroes.push(hero);
                                }
                                else {
                                    var total = result.lookupHeroes[hero];
                                    result.lookupHeroes[hero] = (total + 1);
                                }
                            }
                        }
                    }
                    result.data.push(heroLine);
                }
            }
        }
        return cb(null, result);
    }
    );
}

function showPopular(lookupHeroes, limit, cb) {
    var popularHeroes = [];
    for (var key in lookupHeroes) {
        var newHero = {
            hero: key,
            total: lookupHeroes[key]
        }
        popularHeroes.push(newHero);
    }
    popularHeroes = popularHeroes.sort(function (item1, item2) {
        var value1 = item1.total;
        var value2 = item2.total;
        return value2 - value1;
    });

    console.log("all top heroes");
    // console.log (JSON.stringify(popularHeroes, null, 2));
    var isPretty = false;
    var filename = OUTPUT_FOLDER + "topHeroes.json";
    saveJsonSync(filename, popularHeroes, isPretty);

    console.log("top " + limit + " heroes");
    var maxHeroes = popularHeroes.length > limit ? limit : popularHeroes.length;
    for (var idx = 0; idx < maxHeroes; idx++) {
        var heroItem = popularHeroes[idx];
        var lineTerminator = ",";
        if ((idx + 1) === popularHeroes.length) {
            lineTerminator = "";
        }
        console.log("\t" + JSON.stringify(heroItem) + lineTerminator);
    }
    return cb(null, popularHeroes);
}

function getMatchCombinations(popularHeroes, limit, matchCount) {
    var METHOD_NAME = "getMatchCombinations";
    var combinations = [];
    var maxHeroes = popularHeroes.length > limit ? limit : popularHeroes.length;
    var limitedHeroes = JSON.parse(JSON.stringify(popularHeroes)); // must clone
    limitedHeroes = limitedHeroes.splice(0, maxHeroes);
    limitedHeroes.sort(function (item1, item2) {
        var value1 = item1.hero;
        var value2 = item2.hero;
        return value2 > value1 ? -1 : 1;
    });
    for (var column1 = 0; column1 < limitedHeroes.length; column1++) {
        var hero1Item = limitedHeroes[column1];
        for (var column2 = column1 + 1; column2 < maxHeroes && matchCount >= 2; column2++) {
            var hero2Item = limitedHeroes[column2];
            if (matchCount === 2) {
                var key = hero1Item.hero + ".*" + hero2Item.hero;
                combinations.push(key);
            }
            else {
                for (var column3 = column2 + 1; column3 < maxHeroes && matchCount >= 3; column3++) {
                    var hero3Item = limitedHeroes[column3];
                    if (matchCount === 3) {
                        var key = hero1Item.hero + ".*" + hero2Item.hero + ".*" + hero3Item.hero;
                        combinations.push(key);
                    }
                    else {
                        for (var column4 = column3 + 1; column4 < maxHeroes && matchCount >= 4; column4++) {
                            var hero4Item = limitedHeroes[column4];
                            if (matchCount === 4) {
                                var key = hero1Item.hero + ".*" + hero2Item.hero + ".*" + hero3Item.hero + ".*" + hero4Item.hero;
                                combinations.push(key);
                            }
                            else {
                                for (var column5 = column4 + 1; column5 < maxHeroes && matchCount >= 5; column5++) {
                                    var hero5Item = limitedHeroes[column5];
                                    if (matchCount === 5) {
                                        var key = hero1Item.hero + ".*" + hero2Item.hero + ".*" + hero3Item.hero + ".*" + hero4Item.hero + ".*" + hero5Item.hero;
                                        combinations.push(key);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // console.log (METHOD_NAME + ".3", matchCount);
    // for (var matchIdx = 0; matchIdx < combinations.length; matchIdx++) {
    //     console.log ("\t"+combinations[matchIdx]);
    // }
    return combinations;
}

function showMatches(data, popularHeroes, limit, matchCount) {
    var combinations = getMatchCombinations(popularHeroes, limit, matchCount);

    var lookupMatches = {};
    for (var matchIdx = 0; matchIdx < combinations.length; matchIdx++) {
        var matchString = combinations[matchIdx];
        var regex = new RegExp(matchString, 'g')
        // console.log("matching ", matchString);
        for (var lineIdx = 0; lineIdx < data.length; lineIdx++) {
            var line = data[lineIdx];
            var result = regex.test(line);
            if (result) {
                // console.log("\tfound", line);
                if (!lookupMatches[matchString]) {
                    lookupMatches[matchString] = 1;
                }
                else {
                    var total = lookupMatches[matchString];
                    lookupMatches[matchString] = total + 1;
                }
            }
        }
    }
    var matchedHeroes = [];
    for (var key in lookupMatches) {
        var newHero = {
            heroes: key,
            total: lookupMatches[key]
        }
        if (newHero.total > 1) {
            matchedHeroes.push(newHero);
        }
    }
    matchedHeroes = matchedHeroes.sort(function (item1, item2) {
        var value1 = item1.total;
        var value2 = item2.total;
        return value2 - value1;
    });
    var isPretty = false;
    var filename = OUTPUT_FOLDER + "heroes-" + matchCount + ".json";
    saveJsonSync(filename, matchedHeroes, isPretty);

    var print = PRINT_OUTPUT.replace("[MATCH_COUNT]", matchCount);
    print = print.replace("[MATCHED]", matchedHeroes.length);
    print = print.replace("[TOTAL]", combinations.length);
    console.log(print);
    for (var matchIdx = 0; matchIdx < matchedHeroes.length; matchIdx++) {
        var lineTerminator = ",";
        if ((matchIdx + 1) === matchedHeroes.length) {
            lineTerminator = "";
        }
        var found = matchedHeroes[matchIdx];
        if (found.total > 1) {
            console.log("\t" + JSON.stringify(found) + lineTerminator);
        }
    }

}

function loadTopRoles(lines, cb) {
    var missingHeroes = JSON.parse(JSON.stringify(ROLES));

    var lookupTopRoles = {};
    for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        var line = lines[lineIdx];
        var tokens = line.split(",");
        if (tokens.length >= 5) {
            for (var tokenIdx = 0; tokenIdx < tokens.length; tokenIdx++) {
                var hero = tokens[tokenIdx];
                if (!_.isEmpty(hero)) {
                    if (ROLES[hero]) {
                        if (missingHeroes[hero]) {
                            missingHeroes[hero] = null; // remove it
                        }

                        var role = ROLES[hero].role;
                        if (!lookupTopRoles[role]) {
                            lookupTopRoles[role] = {}
                        }
                        var lookupHero = lookupTopRoles[role];
                        if (!lookupHero[hero]) {
                            lookupHero[hero] = 1;
                        }
                        else {
                            var total = lookupHero[hero];
                            lookupHero[hero] = total + 1;
                        }
                    }
                    else {
                        console.error("WARN: " + line + " not found role [" + hero + "]");
                    }
                }
            }
        }
    }

    for (var key in missingHeroes) {
        if (missingHeroes[key]) {
            var hero = key;
            var role = ROLES[hero].role;
            if (!lookupTopRoles[role]) {
                lookupTopRoles[role] = {}
            }
            var lookupHero = lookupTopRoles[role];
            if (!lookupHero[hero]) {
                lookupHero[hero] = 0;
            }
        }
    }

    return cb(null, lookupTopRoles);
}

function showTopRoles (lookupTopRoles, roleName) {
    var array = [];
    console.log("Top "+ roleName+ " Roles ---");
    var lookupHero = lookupTopRoles[roleName];
    for (var hero in lookupHero) {
        var newHeroItem = {
            hero: hero,
            total : lookupHero[hero]
        };
        array.push (newHeroItem);
    }
    array = array.sort(function (item1, item2) {
        var value1 = item1.total;
        var value2 = item2.total;
        return value2 - value1;
    });

    var isPretty = false;
    var filename = OUTPUT_FOLDER + "top"+roleName+ "Heroes.json";
    saveJsonSync(filename, array, isPretty);
    console.log (JSON.stringify(array, null, 2));
}

function loadRoleCombinations(lines, cb) {
    var lookupRoles = {};
    for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        var line = lines[lineIdx];
        var tokens = line.split(",");
        if (tokens.length >= 5) {
            var lookup = {};
            for (var tokenIdx = 0; tokenIdx < tokens.length; tokenIdx++) {
                var hero = tokens[tokenIdx];
                if (!_.isEmpty(hero)) {
                    if (ROLES[hero]) {
                        var role = ROLES[hero].role;
                        if (!lookup[role]) {
                            lookup[role] = 1;
                        }
                        else {
                            var total = lookup[role];
                            lookup[role] = total + 1;
                        }
                    }
                    else {
                        console.error("WARN: " + line + " not found role [" + hero + "]");
                    }
                }
            }
            var role = {
                controls: lookup["Control"] || 0,
                damages: lookup["Damage"] || 0,
                supports: lookup["Support"] || 0,
                tanks: lookup["Tank"] || 0,
            }

            var key = "role:t" + role.tanks + ":d" + role.damages + ":s" + role.supports + ":c" + role.controls;
            if (!lookupRoles[key]) {
                lookupRoles[key] = [];
            }
            var array = lookupRoles[key];
            var found = false;
            for (var heroIdx = 0; heroIdx < array.length; heroIdx++) {
                var heroLine = array[heroIdx];
                if (heroLine === line) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                array.push(line);
            }
        }
    }
    console.log("Role Combinations ---");
    var isPretty = false;
    var filename = OUTPUT_FOLDER + "roleHeroes.json";
    saveJsonSync(filename, lookupRoles, isPretty);

    console.log(JSON.stringify(lookupRoles));
    return cb(null, lookupRoles);
}

function showRoleCombinations(lookupRoles) {
    var roleTotals = {};
    for (var key in lookupRoles) {
        if (!roleTotals[key]) {
            var heroes = lookupRoles[key];
            roleTotals[key] = {
                name: key,
                total: heroes.length
            }
        }
    }
    console.log("Top Role Combinations ---");
    var array = dictionaryToArray(roleTotals);
    array.sort(function (item1, item2) {
        var value1 = item1.total;
        var value2 = item2.total;
        return value2 - value1;
    });

    console.log(JSON.stringify(array, null, 2));
    var isPretty = false;
    var filename = OUTPUT_FOLDER + "topRoleCombinations.json";
    saveJsonSync(filename, array, isPretty);
}

function showFriendships(lookupFriendship) {
    console.log("Top Friendships ---");
    var array = dictionaryToArray(lookupFriendship);
    array.sort(function (item1, item2) {
        var value1 = item1.total;
        var value2 = item2.total;
        return value2 - value1;
    });
    console.log(JSON.stringify(array, null, 2));

    var isPretty = false;
    var filename = OUTPUT_FOLDER + "topFriendships.json";
    saveJsonSync(filename, array, isPretty);
}

var heroesResult = {
    data: [],
    heroes: [],
    lookupFriendship: {},
    lookupHeroes: {},
    popularHeroes: [],
    lookupRoleCombinations: {},
    lookupTopRoles : {}
};
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
        },
        function (cb) {
            loadHeroes(FILE, function (err, result) {
                if (err) {
                    console.error("loadHeroFile failed", err);
                    return cb(err);
                }
                heroesResult = result;
                console.log("total data", heroesResult.data.length);
                console.log("total heroes", heroesResult.heroes.length);
                // console.log("friendship", JSON.stringify(heroesResult.lookupFriendship, null, 2));
                showPopular(heroesResult.lookupHeroes, LIMIT, function (err, populars) {
                    heroesResult.popularHeroes = populars;
                });
                return cb(null);
            });
        },
        function (cb) {
            showFriendships(heroesResult.lookupFriendship);
            return cb(null);
        },
        function (cb) {
            loadRoleCombinations(heroesResult.data, function (err, lookupRoleCombinations) {
                if (err) {
                    console.error("loadRoles failed", err);
                    return cb(err);
                }
                heroesResult.lookupRoleCombinations = lookupRoleCombinations;
                return cb(null);
            });
        },
        function (cb) {
            showRoleCombinations(heroesResult.lookupRoleCombinations);
            return cb(null);
        },
        function (cb) {
            loadTopRoles(heroesResult.data, function (err, result) {
                heroesResult.lookupTopRoles= result;
                return cb(null);
            });            
        },
        function (cb) {
            showTopRoles(heroesResult.lookupTopRoles, "Tank");
            return cb(null);
        },
        function (cb) {
            showTopRoles(heroesResult.lookupTopRoles, "Damage");
            return cb(null);
        },
        function (cb) {
            showTopRoles(heroesResult.lookupTopRoles, "Support");
            return cb(null);
        },
        function (cb) {
            showTopRoles(heroesResult.lookupTopRoles, "Control");
            return cb(null);
        },
        function (cb) {
            showMatches(heroesResult.data, heroesResult.popularHeroes, LIMIT, 2);
            return cb(null);
        },
        function (cb) {
            showMatches(heroesResult.data, heroesResult.popularHeroes, LIMIT, 3);
            return cb(null);
        },
        function (cb) {
            showMatches(heroesResult.data, heroesResult.popularHeroes, LIMIT, 4);
            return cb(null);
        },
        function (cb) {
            var newLimit = LIMIT - 50;
            showMatches(heroesResult.data, heroesResult.popularHeroes, newLimit, 5);
            return cb(null);
        }
    ],
    function (err, results) {
        console.error("done");
    }
);
