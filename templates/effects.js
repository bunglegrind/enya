/*jslint browser, devel, unordered, fart*/
import utils from "../utils.js";

export default Object.freeze(function (parameters, dom, handles, labels) {
    const effects = Object.entries(parameters).filter(
        ([k]) => handles.save_preset_fields().includes(k)
    );
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
                            utils.extract(
                                handles.save_preset_fields(), parameters
                            ),
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
                        return await handles.load_preset(
                            await utils.load(
                                target
                            ),
                            async function end_cb(msg) {
                                await utils.confirm_popup(
                                    dom,
                                    msg
                                );
                                return await handles.refresh();
                            }

                        );

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
        dom.main("effects")(...effects.map(function ([name, values]) {
            return utils.draw_component({
                dom,
                name,
                enabled: values.status,
                edit_callback: handles.edit_effect(name, values),
                enable_callback: handles.toggle_effect(name),
                label: labels[name]
            });
        })),
        dom.footer("footer")(
            dom.div("battery")(parameters.battery.value + "% 🔋")
        )

    ];
});
