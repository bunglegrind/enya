/*jslint browser, unordered*/
import dom_builder from "./lib/dom.js";
import connect from "./connect.js";
import main from "./main.js";

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


    function draw() {
        if (!state.connected) {
            root.replaceChildren(connect(dom));
            return;
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

        root.replaceChildren(...main(state, dom));
    }

    const drawer = Object.freeze({update, init});
    guitar.set_drawer(drawer);

    return drawer;
}


export default Object.freeze(factory);
