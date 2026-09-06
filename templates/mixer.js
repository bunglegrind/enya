/*jslint browser, unordered, fart*/
import utils from "../utils.js";

export default Object.freeze(function (parameters, dom, handles, labels) {
    const mixer = Object.entries(parameters).filter(
        ([k]) => handles.mixer_fields().includes(k)
    ).map(function (entry) {
        return utils.draw_range({
            dom,
            type: entry[0],
            value: entry[1].value,
            range: parameters.metadata[entry[0]].parameters[0],
            labels,
            callback: handles.update_volume,
            label: "Volume"
        });
    });
    return [
        dom.header("header")(
            dom.button({
                id: "back",
                click: handles.back
            })("<=")
        ),
        dom.main("mixer")(
            dom.h1("mixer")("Mixer"),
            ...mixer
        ),
        dom.footer("footer")(
            dom.div("battery")(parameters.battery.value + "% 🔋")
        )
    ];
});
