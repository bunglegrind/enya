/*jslint browser, unordered*/
import dom_builder from "./lib/dom.js";
import connect from "./connect.js";
import guitar  from "./guitar.js";

function factory(root, doc) {
    const dom = dom_builder("enya", doc);

    function draw(state) {
        if (!state.connected) {
            root.replaceChildren(connect(dom));
            return;
        }
        if (!state.battery) {
            return guitar.ask({prop: "battery", state});
        }
    }

    return Object.freeze({draw});
}


export default Object.freeze(factory);