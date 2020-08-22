var fs = require('fs');
var Path = require('path');
var async = require('async');
var moment = require('moment');
var EOL = require('os').EOL;
var _ = require('lodash');
var LOOKUP_ROLE = require("./roles.json");
var ROLES = require("./roleCombinations.json");

const OUTPUT_FOLDER = "C:/projects/tutorials/disney-heroes/data/";

var HERO = "Jafar"
if (process.argv.length >= 3) {
    HERO = process.argv[2];
}

function dictionaryToArray(lookup) {
    var array = [];
    for (var key in lookup) {
        var value = lookup[key];
        array.push(value);
    }
    return array;
}

function findRole(hero) {
    var foundHeroes = [];
    for (var key in ROLES) {
        var heroes = ROLES[key];
        for (var heroIdx = 0; heroIdx < heroes.length; heroIdx++) {
            var newHeroItem = {
                roles : key,
                totalHero: 0,
                Tank : [],
                Damage : [],
                Support : [],
                Control : []
            };
            var heroLine = heroes[heroIdx];
            if (heroLine.indexOf(hero) !== -1) {
                var ok = true;
                var totalHero = 0;
                var tokens = heroLine.split(",");

                for (var tokenIdx = 0; tokenIdx < tokens.length; tokenIdx++) {
                    var token = tokens[tokenIdx];
                    if (!_.isEmpty(token)) {
                        // we are good to go
                        if (!LOOKUP_ROLE[token]) {
                            console.error ("role not found", token);
                            ok = false;
                            break;
                        }
                        var roleName = LOOKUP_ROLE[token];
                        newHeroItem[roleName].push(token);
                        newHeroItem.totalHero++;
                    }
                }
                if (ok) {
                    foundHeroes.push(newHeroItem);
                }
            }
        }
    }
    return foundHeroes;
}

var result = findRole(HERO);
console.log (HERO+ " results", JSON.stringify(result, null, 2));

