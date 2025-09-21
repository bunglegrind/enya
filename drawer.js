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

    function update(updated_state) { //jslint-ignore-line
/*jslint-disable*/
        state = {...state, ...updated_state};
/*jslint-enable*/
        draw();
    }

    function retrieve(prop) {
        return state[prop];
    }


    function draw() {
        if (!state.connected) {
            return root.replaceChildren(connect(dom, guitar));
        }
        if (state.battery === undefined) {
            return guitar.ask("battery");
        }
        if (state.autoshutdown === undefined) {
            return guitar.ask("autoshutdown");
        }
        if (state.preset === undefined) {
            return guitar.ask("preset");
        }

        if (state.mixer !== undefined) {
            if (state.mixer.length !== guitar.mixer_length()) {
                return guitar.ask("mixer", state.mixer.length);
            }

            return root.replaceChildren(...mixer(state, dom, guitar));
        }

        if (state.effects !== undefined) {
            if (state.effects.length !== guitar.effects_length()) {
                return guitar.ask("effects", state.effects.length);
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
