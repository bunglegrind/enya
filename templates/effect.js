/*jslint browser, devel, unordered, fart*/
import utils from "../utils.js";


export default Object.freeze(function (
    parameters,
    dom,
    handles,
    global_labels,
    effect
) {
    function update_effect({currentTarget}) {
        const obj = Object.create(null);
        currentTarget.querySelectorAll("[name]").forEach(function (e) {
            obj[e.name] = Number(e.value);
        });

        console.log(obj);

        handles.update_effect();
    }

    const meta_parameters = parameters.metadata[effect].parameters;
    return [
        dom.header("header")(
            dom.button({
                id: "back",
                click: handles.back_edit
            })("<=")
        ),
        dom.main({id: "effect", change: update_effect})(
            dom.h1("effect-title")(global_labels[effect]),
            ...meta_parameters.filter(
                ({name}) => name !== "status"
            ).map(function ({name, min, max, labels}) {
                if (!labels) {
                    return utils.draw_range({
                        dom,
                        type: name,
                        value: parameters[effect][name],
                        range: {min, max},
                        labels: global_labels,
                        callback: handles.update_effect(
                            effect,
                            parameters[effect]
                        ),
                        label: "Value"
                    });
                }

                return utils.draw_select({
                    dom,
                    type: name,
                    value: parameters[effect][name],
                    options: labels,
                    callback: handles.update_effect(
                        effect,
                        parameters[effect]
                    ),
                    label: "Type: ",
                    selected: Number(parameters[effect][name])
                });

            })
        ),
        dom.footer("footer")(
            dom.div("battery")(parameters.battery.value + "% 🔋")
        )

    ];
});

