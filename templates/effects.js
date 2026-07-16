/*jslint browser, devel, unordered*/
import utils from "../utils.js";

export default Object.freeze(function (state, dom, handles) {
    return [
        dom.header("header")(
            dom.button({
                id: "back",
                click: handles.back
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
                        utils.save(
                            utils.extract(handles.save_preset_fields(), state),
                            name
                        );
                    }
                }
            })("Save..."),
            dom.label({
                id: "load",
                change: async function ({target}) {
                    const confirm = await utils.proceed_popup(
                        dom,
                        "The current effects configuration will be deleted. "
                        + "Proceed?"
                    );
                    if (confirm) {
                        const return_message = await handles.load_preset(
                            await utils.load(target)
                        );

                        await utils.confirm_popup(dom, return_message);
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
                click: handles.mixer
            })("⚙")
        ),
        dom.main("effects")(JSON.stringify(state))
    ];
});
