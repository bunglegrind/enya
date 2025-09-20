/*jslint browser, unordered*/
import guitar from "./guitar.js";


export default Object.freeze(function (state, dom) {
    return [
        dom.button({
            id: "disconnect",
            "click": guitar.disconnect
        })("Disconnect"),
        dom.footer("footer")(
            dom.div("battery")(state.battery + "% 🔋")
        )
    ];

});

