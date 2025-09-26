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
                click: function (event) {
                    event.stopImmediatePropagation();
                    utils.enter_name_popup(dom, "Please enter a filename: ", function (name) {
                        utils.save(state.effects, name);
                    });
                }
            })("Save..."),
            dom.label({
                id: "load",
                change: async function ({target}) {
                    const loaded_preset = await utils.load(target);
                    utils.proceed_popup(dom, "The current preset configuration will be deleted. Proceed?",
                        function () {
                        console.log(loaded_preset);
                        });
                }
            })(dom.input({type: "file", accept: "application/json"}), "Load"),
            dom.button({
                id: "undo",
                click: utils.load
            })("Undo"),
            dom.button({
                id: "mixer",
                click: guitar.mixer
            })("⚙")
        ),
        dom.main("effects")(JSON.stringify(state))
    ];
});
