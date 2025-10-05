/*jslint browser, unordered*/

import message from "../message-helper.js";
import actual_messages from "./messages.js";
import jSCheck from "./jscheck.js";
const jsc = jSCheck();


jsc.claim("verify actual messages", function (verdict, a) {
    return verdict(message.validate(a) === true);
}, jsc.sequence(actual_messages));


jsc.claim("encode question", function (verdict, a) {

}, []);


jsc.check({
    detail: 3,
    nr_trials: actual_messages.length,
    on_report: function (report) {
        let output = document.getElementById("output");
        output.innerHTML = report;
    }
});
