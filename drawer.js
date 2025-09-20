/*jslint browser, unordered*/
import dom_builder from "./lib/dom.js";
import connect from "./connect.js";
import main from "./main.js";

function factory(root, doc, guitar) {
    const dom = dom_builder("enya", doc);


    function draw(state) {
        if (!state.connected) {
            root.replaceChildren(connect(dom));
            return;
        }
        if (!state.battery) {
            return guitar.ask({prop: "battery", state});
        }

        root.replaceChildren(...main(state, dom));
    }
    guitar.set_drawer(draw);

    return Object.freeze({draw});
}


export default Object.freeze(factory);
