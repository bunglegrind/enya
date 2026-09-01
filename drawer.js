/*jslint browser, unordered, for*/
import dom_builder from "./lib/dom.js";
import connect from "./templates/connect.js";
import main from "./templates/main.js";
import mixer from "./templates/mixer.js";
import effects from "./templates/effects.js";
import ui from "./sonic-ui.js";

const {screens, labels} = ui;

const views = {connect, main, mixer, effects};

function factory(root, doc, guitar) {
    const dom = dom_builder(doc);

    let state;

    function init() {
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

            await callback("Preset imported correctly");
            reset(screens.effects);
            return await draw("effects");
        };
    }

    const handles = Object.freeze({
        connect: async function () {
            pubsub = await guitar.connect(init);
            return await draw("main");
        },
        disconnect: async function () {

// cleanup performed by the cleanup handle

            await guitar.disconnect();
            return draw("connect");
        },
        edit_preset: async function () {
            reset(screens.effects);
            return await draw("effects");
        },
        mixer: async function () {
            return await draw("mixer");
        },
        set_preset: async function ({currentTarget}) {

            await guitar.switch_preset(
                Number(currentTarget.getAttribute("data-row")),
                Number(currentTarget.getAttribute("data-element"))
            );
            draw();
        },
        set_shutdown: async function ({currentTarget}) {
            await guitar.update(
                "autoshutdown",
                {value: Number(currentTarget.getAttribute("data-value"))}
            );

            draw();
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
            if (
                data.some((d) => !guitar.metadata().effects.includes(d[0]))
                || guitar.metadata().effects.some(
                    (f) => !data.map((d) => d[0]).includes(f)
                )
            ) {
                throw new Error("Invalid uploaded preset");
            }

            await Promise.all(
                data.map(function ([component, parameters]) {
                    if (!parameters.status) {
                        return guitar.disable(component);
                    }
                    return guitar.enable(component).then(
                        function () {
                            return guitar.update(component, parameters);
                        }
                    );
                })
            );

            return await callback("Preset successfully loaded");
        },
        refresh: () => draw(),
        save_preset_fields: () => guitar.metadata().effects,
        mixer_fields: () => guitar.metadata().mixer,
        update_volume: async function (name, value) {
            await guitar.update(name, {value});
            return await draw();
        }
    });

    async function draw(s = screen) {
        screen = s;
        if (screen === "connect") {
            return root.replaceChildren(connect(dom, handles));
        }


        const parameters = await guitar.get(screens[screen]);
        parameters.metadata = guitar.metadata(screens[screen]);

        return root.replaceChildren(
            ...views[screen](parameters, dom, handles, labels)
        );
    }


    return Object.freeze({init});
}

export default Object.freeze(factory);
