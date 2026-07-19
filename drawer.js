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

    const handles = Object.freeze({
        connect: async function () {
            const pubsub = await guitar.connect(init);
            pubsub.replace(update);
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
        load_preset: async function () {
            return await "File loaded";
        },
        save_preset_fields: function () {
            return [
                "amp", "eq", "noise", "mod", "delay", "reverb"
            ];
        }
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
