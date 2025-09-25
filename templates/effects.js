/*jslint browser, unordered*/
import utils from "../utils.js";


export default Object.freeze(function (state, dom, guitar) {
    function popup(prompt, cb) {
        dom.div("popup")(
            dom.p("prompt")(prompt),
            dom.input({type: "text"}),
            dom.button({})
        );
    }
    return [
        dom.header("header")(
            dom.button({
                id: "back",
                click: guitar.back
            })("<="),
            dom.button({
                id: "save",
                click: function () {
                    popup("Please enter a filename: ", function (name) {
                        utils.save(state.effects, name);
                    });
                }
            })("Save..."),
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
