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

jsc.claim("semantic validation", function (verdict, a) {
    verdict(
        message.is_correct(([a])) === true
    );
}, jsc.sequence(opcodes));


jsc.check({
    detail: 3,
    nr_trials: actual_messages.length,
    on_report: function (report) {
        let output = document.getElementById("output");
        output.innerHTML = report;
    }
});
