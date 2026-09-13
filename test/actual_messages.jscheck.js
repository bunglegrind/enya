/*jslint browser, unordered, fart*/

import message_factory from "../message.js";
import actual_messages from "./messages.js";
import sonic from "../sonic-parameters.js";
import jSCheck from "./jscheck.js";
const jsc = jSCheck();

const msg_builder = message_factory(sonic.messages);

jsc.claim("verify actual packets", function (verdict, array) {
    try {
        msg_builder.from(array);
    } catch (ignore) {
        return verdict(false);
    }

    return verdict(true);
}, jsc.sequence(actual_messages));

jsc.claim("decode and encode actual messages", function (verdict, m) {
    const transformed = msg_builder.from(m).toArray();
    return verdict(m.join() === transformed.join());
}, jsc.sequence(actual_messages));

export default Object.freeze(function () {
    jsc.check({
        detail: 3,
        nr_trials: actual_messages.length,
        on_report: function (report) {
            let output = document.getElementById("output1");
            output.innerHTML += report;
        }
    });
});
