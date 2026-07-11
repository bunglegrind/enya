/*jslint browser, unordered*/
import dom_builder from "./lib/dom.js";
import connect from "./templates/connect.js";
import main from "./templates/main.js";
import mixer from "./templates/mixer.js";
import effects from "./templates/effects.js";

function factory(root, doc, guitar) {
    const dom = dom_builder(doc);

    let state;

    function init() {
        guitar.reset();
        state = {connected: false};
        draw();
    }

    function update(updated_state) {
        if (
            state.effects
            && (
                Object.keys(state.effects).length
                !== guitar.get_effects_length()
            )
        ) {
            state = {...state, effects: {...state.effects, ...updated_state}};
        } else if (
            state.mixer
            && (
                Object.keys(state.mixer).length
                !== guitar.get_mixer_length()
            )
        ) {
            state = {...state, mixer: {...state.mixer, ...updated_state}};

        } else {
            state = {...state, ...updated_state};
        }
        return draw();
    }

    function retrieve(prop) {
        return state[prop];
    }


    function draw() {
        if (!state.connected) {
            return root.replaceChildren(connect(dom, guitar));
        }
        if (state.battery === undefined) {
            return guitar.query("battery");
        }
        if (state.autoshutdown === undefined) {
            return guitar.query("autoshutdown");
        }
        if (state.preset === undefined) {
            return guitar.query("preset");
        }

        if (state.mixer !== undefined) {
            if (Object.keys(state.mixer).length !== guitar.get_mixer_length()) {
                return guitar.group_query(
                    "mixer",
                    Object.keys(state.mixer).length
                );
            }

            return root.replaceChildren(...mixer(state, dom, guitar));
        }

        if (state.mixer) {
            if (
                Object.keys(state.mixer).length
                !== guitar.get_mixer_length()
            ) {
                return guitar.group_query(
                    "mixer",
                    Object.keys(state.mixer).length
                );
            }

            return root.replaceChildren(...mixer(state, dom, guitar));
        }


        if (state.effects) {
            if (
                Object.keys(state.effects).length
                !== guitar.get_effects_length()
            ) {
                return guitar.group_query(
                    "effects",
                    Object.keys(state.effects).length
                );
            }

            return root.replaceChildren(...effects(state, dom, guitar));
        }


        return root.replaceChildren(...main(state, dom, guitar));
    }

    const drawer = Object.freeze({update, init, retrieve});
    guitar.set_drawer(drawer);

    return drawer;
}

export default Object.freeze(factory);
