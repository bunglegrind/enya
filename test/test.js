/*jslint browser, unordered*/

import message from "../message-helper.js";
import actual_messages from "./messages.js";
import sonic from "../sonic-settings.js";
import jSCheck from "./jscheck.js";
const jsc = jSCheck();


jsc.claim("verify actual messages", function (verdict, a) {
    return verdict(message.validate(a) === true);
}, jsc.sequence(actual_messages));

const opcodes = Object.values(sonic.commands).map((x) => x.opcode);

jsc.claim("asking question", function (verdict, a) {
    verdict(
        message.validate(message.encode([a])) === true
    );
}, jsc.sequence(opcodes));

jsc.claim("semantic opcode validation", function (verdict, a) {
    verdict(
        message.is_correct([a], sonic.commands) === opcodes.includes(a)
    );
}, jsc.integer(0, 255));

const commands = Object.entries(sonic.commands);

commands.forEach(function ([command, p]) {
    function classifier(is_permitted) {
        return function (parameters) {
            let i = 1;
            return (
                p.parameters.some(function ({max}) {
                    i += 1;
                    if (max < 256) {
                        return false;
                    }
                    i += 1;
                    return (
                        is_permitted
                        ? (parameters[i - 2] * 256 + parameters[i - 1]) > max
                        : (parameters[i - 2] * 256 + parameters[i - 1]) <= max
                    );
                })
                ? undefined
                : ""
            );
        };
    }

    jsc.claim(
        `semantic ${command} validation`,
        function (verdict, ...parameters) {
            verdict(message.is_correct(parameters, sonic.commands));
        },
        [
            jsc.sequence([p.opcode]),
            ...p.parameters.flatMap(function ({min, max}) {
                return (
                    max < 256
                    ? jsc.integer(min, max)
                    : [jsc.integer(0, 255), jsc.integer(0, 255)]
                );
            })
        ],
        classifier(true)
    );

    jsc.claim(
        `semantic ${command} validation - bad parameters`,
        function (verdict, ...parameters) {
            verdict(!message.is_correct(parameters, sonic.commands));
        },
        [
            jsc.sequence([p.opcode]),
            ...p.parameters.flatMap(function ({max}) {
                return (
                    max < 256
                    ? jsc.integer(max + 1, 255)
                    : [jsc.integer(0, 255), jsc.integer(0, 255)]
                );
            })
        ],
        classifier(false)
    );
});



jsc.check({
    detail: 3,
    nr_trials: actual_messages.length,
    on_report: function (report) {
        let output = document.getElementById("output");
        output.innerHTML = report;
    }
});
