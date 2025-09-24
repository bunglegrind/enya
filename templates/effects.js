/*jslint browser, unordered*/
import utils from "../utils.js";

export default Object.freeze(function (state, dom, guitar) {
    return [
        dom.header("header")(
            dom.button({
                id: "back",
                click: guitar.back
            })("<="),
            dom.button({
                id: "save",
                click: utils.save
            })("Save"),
            dom.button({
                id: "load",
                click: utils.load
            })("Load"),
            dom.button({
                id: "undo",
                click: utils.load
            })("Undo"),
            dom.button({
                id: "mixer",
                click: guitar.disconnect
            })("⚙")
        ),
        dom.main("effects")(JSON.stringify(state))
    ];
});
