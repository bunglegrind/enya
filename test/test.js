/*jslint browser, unordered*/

import message from "../message-helper.js";
import actual_messages from "./messages.js";
import sonic from "../sonic-settings.js";
import jSCheck from "./jscheck.js";
const jsc = jSCheck();
const jsc1 = jSCheck();


jsc1.claim("verify actual messages", function (verdict, a) {
    return verdict(message.validate(a) === true);
}, jsc1.sequence(actual_messages));

const opcodes = Object.values(sonic.commands).map((x) => x.opcode);

jsc.claim("asking question", function (verdict, a) {
    verdict(
        message.validate(message.encode([a])) === true
    );
}, jsc.sequence(opcodes));

const commands = Object.entries(sonic.commands);

commands.forEach(function ([command, p]) {
    function classifier(parameters) {
        let i = 1;
        return (
            p.parameters.some(function ({max}) {
                i += 1;
                if (max < 256) {
                    return false;
                }
                i += 1;
                return (parameters[i - 2] * 256 + parameters[i - 1]) > max;
            })
            ? undefined
            : ""
        );
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
                    : [jsc.integer(0, 2), jsc.integer(0, 255)]
                );
            })
        ],
        classifier
    );

    function my_specifier(params) {
        return function generator() {
            const forged = Math.floor(Math.random() * params.length);
            return params.flatMap(function ({min, max}, i) {
                if (i !== forged) {
                    if (max < 256) {
                        return jsc.integer(min, max)();
                    }
                    let extracted = jsc.integer(min, max)();
                    return [Math.floor(extracted / 256), extracted % 256];
                }
                if (max < 256) {
                    return jsc.integer(max + 1, 255)();
                }
                let bad_extracted = jsc.integer(max + 1, 65535)();
                return [Math.floor(bad_extracted / 256), bad_extracted % 256];
            });
        };
    }

    jsc.claim(
        `semantic ${command} validation - bad parameters`,
        function (verdict, ...parameters) {
            verdict(!message.is_correct(parameters.flat(), sonic.commands));
        },
        [
            jsc.sequence([p.opcode]),
            my_specifier(p.parameters)
        ]
    );
});



jsc.check({
    detail: 3,
    nr_trials: 300,
    on_report: function (report) {
        let output = document.getElementById("output");
        output.innerHTML = report;
    }
});

jsc1.check({
    detail: 3,
    nr_trials: actual_messages.length,
    on_report: function (report) {
        let output = document.getElementById("output1");
        output.innerHTML = report;
    }
});
