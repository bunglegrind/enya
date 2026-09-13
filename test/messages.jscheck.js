/*jslint browser, unordered, fart*/

import message_factory from "../message.js";
import sonic from "../sonic-parameters.js";
import jSCheck from "./jscheck.js";
const jsc = jSCheck();

const msg_builder = message_factory(sonic.messages);

const messages = Object.keys(sonic.messages);

jsc.claim("query", function (verdict, msg) {
    verdict(
        msg_builder.from(msg_builder.query(msg).toBuffer()).get_msg() === msg
    );
}, jsc.one_of(messages));

jsc.claim(
    "query invalid messages",
    function (verdict, msg) {
        try {
            msg_builder.query(msg);
        } catch (e) {
            return verdict(e.message.startsWith("Unknown message"), e);
        }

        verdict(false);

    },
    jsc.string(),
    function classifier(str) {
        if (messages.includes(str)) {
            return;
        }
        return "";
    }
);

Object.entries(sonic.messages).forEach(function ([message_name, p]) {
    jsc.claim(
        `put: ${message_name}`,
        function (verdict, msg, parameters) {
            verdict(
                msg_builder.from(
                    msg_builder.put(msg, parameters).toBuffer()
                ).get_msg() === msg
            );
        },
        [
            message_name,
            jsc.object(
                jsc.array(p.parameters.map(({name}) => name)),
                p.parameters.map(({min, max}) => jsc.integer(min, max))
            )
        ]
    );

    function specifier(parameters) {
        return function generator() {
            const to_remove = jsc.integer(0, parameters.length - 2)();
            const par = [...parameters];
            par.splice(to_remove, 1);
            return jsc.object(
                jsc.array(par.map(({name}) => name)),
                par.map(({min, max}) => jsc.integer(min, max))
            )();
        };
    }


    if (p.parameters.length > 1) {
        jsc.claim(
            `put missing parameters: ${message_name}`,
            function (verdict, msg, parameters) {
                let message;
                try {
                    message = msg_builder.put(msg, parameters);
                } catch (e) {
                    return verdict(
                        e.message.startsWith("Invalid parameter"),
                        e
                    );
                }
                return verdict(false, message);
            },
            [
                message_name,
                specifier(p.parameters)
            ]
        );
    }

    jsc.claim(
        `response: ${message_name}`,
        function (verdict, msg, parameters) {
            verdict(
                msg_builder.from(
                    msg_builder.response(msg, parameters).toBuffer()
                ).get_msg() === msg
            );
        },
        [
            message_name,
            jsc.object(
                jsc.array(p.parameters.map(({name}) => name)),
                p.parameters.map(({min, max}) => jsc.integer(min, max))
            )
        ]
    );

    function my_specifier(params) {
        return function generator() {
            const g = params.map(
                ({min, max}) => jsc.integer(min, max)
            );
            const forged = Math.floor(Math.random() * params.length);
            const max = params[forged].max;
            if (max < 256) {
                g[forged] = jsc.integer(max + 1, 255);
            } else {
                g[forged] = jsc.integer(max + 1, 65535);
            }

            return jsc.object(
                jsc.array(p.parameters.map(({name}) => name)),
                g
            )();
        };
    }

    const only_queries = ["firmware", "id"];

    if (!only_queries.includes(message_name)) {
        jsc.claim(
            `invalid put parameters: ${message_name}`,
            function (verdict, msg, parameters) {
                try {
                    msg_builder.put(msg, parameters);
                } catch (e) {
                    return verdict(
                        e.message.startsWith("Invalid parameter"),
                        e
                    );
                }

                verdict(false);

            },
            [
                message_name,
                my_specifier(p.parameters)
            ]
        );
    }
});

export default Object.freeze(function () {
    jsc.check({
        detail: 3,
        nr_trials: 300,
        on_report: function (report) {
            let output = document.getElementById("output");
            output.innerHTML += report;
        }
    });
});

