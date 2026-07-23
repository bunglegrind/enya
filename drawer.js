/*jslint browser, unordered, for*/
import dom_builder from "./lib/dom.js";
import connect from "./templates/connect.js";
import main from "./templates/main.js";
import mixer from "./templates/mixer.js";
import effects from "./templates/effects.js";
import screens from "./sonic-ui.js";

const views = {connect, main, mixer, effects};

function factory(root, doc, guitar) {
    const dom = dom_builder(doc);

    let state;

    function init() {
        guitar.reset();
        state = {connected: false};
        draw("connect");
    }

    function reset(keys) {
        state = keys.reduce(function (acc, k) {
            const toR = {...acc};
            toR[k] = undefined;
            return toR;
        }, state);
    }

    let screen;
    async function update(updated_state, s = screen) {
        state = {...state, ...updated_state};
        return await draw(s);
    }

    function retrieve(prop) {
        return state[prop];
    }

    let pubsub;

    function verify(expected, actual) {
        const expected_pars = Object.entries(expected[1]);
        const actual_pars = Object.entries(actual[1]);

        return (
            expected[0] === actual[0]
            && expected_pars.every(function ([k, v], i) {
                return (
                    k === actual_pars[i][0]
                    && v === actual_pars[i][1]
                );
            })
        );
    }

    function load(assessing, data, callback) {
        return async function (state) {
            if (!verify(assessing, Object.entries(state)[0])) {
                throw new Error("Error. Aborting");
            }
            if (data.length > 0) {
                pubsub.set(load(data[0], data.slice(1), callback));
                return await guitar.write(data[0][0], data[0][1]);
            }

            pubsub.set(update);
            await callback("Preset imported correctly");
            reset(screens.effects);
            return await draw("effects");
        };
    }

    const effects_msgs = ["amp", "eq", "noise", "mod", "delay", "reverb"];
    const mixer_msgs = [
        "guitar", "otg", "otg", "box",
        "line", "ear", "bluetooth"
    ];

    const handles = Object.freeze({
        connect: async function () {
            pubsub = await guitar.connect(init);
            pubsub.set(update);
            reset(screens.main);
            return await update(
                {connected: true, messages: guitar.messages},
                "main"
            );
        },
        disconnect: async function () {

// cleanup performed by the cleanup handle

            return await guitar.disconnect();
        },
        edit_preset: async function () {
            reset(screens.effects);
            return await draw("effects");
        },
        mixer: async function () {
            reset(screens.mixer);
            return await draw("mixer");
        },
        set_preset: async function ({currentTarget}) {

            return await guitar.set_preset(
                Number(currentTarget.getAttribute("data-row")),
                Number(currentTarget.getAttribute("data-element")),
                retrieve("preset")
            );
        },
        set_shutdown: async function ({currentTarget}) {
            return await guitar.set_shutdown(
                Number(currentTarget.getAttribute("data"))
            );
        },
        back: function () {
            reset(screens.main);
            return draw("main");
        },
        load_preset: async function (data, callback) {
            if (data.amp.type === 0) {
                delete data.amp.presence;
            }
            data = Object.entries(data);
            if (data.some((d) => !effects_msgs.includes(d[0]))) {
                throw new Error("Invalid uploaded preset");
            }

            pubsub.set(load(data[0], data.slice(1), callback));
            return await guitar.write(data[0][0], data[0][1]);
        },
        save_preset_fields: () => effects_msgs,
        mixer_fields: () => mixer_msgs
    });

    async function draw(s) {
        screen = s;

        if (!state.connected) {
            return await root.replaceChildren(connect(dom, handles));
        }

        const key = screens[screen].find((k) => state[k] === undefined);
        if (key) {
            return await guitar.query(key);
        }

        return root.replaceChildren(
            ...views[screen](state, dom, handles)
        );
    }


    return Object.freeze({update, init});
}

export default Object.freeze(factory);
