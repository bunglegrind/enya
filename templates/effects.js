/*jslint browser, devel, unordered*/
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
                click: async function (event) {
                    event.stopImmediatePropagation();
                    const name = await utils.enter_name_popup(
                        dom,
                        "Please enter a filename: "
                    );
                    if (name) {
                        utils.save(state.effects, name);
                    }
                }
            })("Save..."),
            dom.label({
                id: "load",
                change: async function ({target}) {
                    const confirm = await utils.proceed_popup(
                        dom,
                        "The current preset confwill be deleted. Proceed?"
                    );
                    if (confirm) {
                        await guitar.load_preset(await utils.load(target));
                    }
                    target.value = "";
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
