'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

//const scriptRules = require('./script.json');
var scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('Hallo vom Apfelbot. Oder Eimerbot. Oder Apfeleimerbot...')
                .then(() => 'speak');
        }
    },

    speak: {
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "STOP":
                        return bot.setProp("silent", true);
                    case "START":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }

            function getNews() {
                switch (upperText) {
                    case "NEWS":
                        return Promise.resolve(bot.say('TESTER'));
                    default:
                        return Promise.resolve();
                }
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

                if (!_.has(scriptRules, upperText) && !_.has('NEWS')) {
                    return bot.say(`Sorry, leider bin ich noch lange nicht so schlau wie Siri und hab das nicht verstanden.`).then(() => 'speak');
                }

                //var request = require('request');
                //var requrl = request('')

                var response = scriptRules[upperText];
                var lines = response.split(/(<img src=\'[^>]*\'\/>)/);

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    if (!line.startsWith("<")) {
                        p = p.then(function() {
                            return bot.say(line);
                        });
                    } else {
                        // p = p.then(function() {
                        //     var start = line.indexOf("'") + 1;
                        //     var end = line.lastIndexOf("'");
                        //     var imageFile = line.substring(start, end);
                        //     return bot.sendImage(imageFile);
                        // });
                    }
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getNews)
                .then(getSilent)
                .then(processMessage);
        }
    }
});