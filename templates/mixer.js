/*jslint browser, unordered, fart*/
import utils from "../utils.js";

export default Object.freeze(function (parameters, dom, handles) {
    const mixer = Object.entries(parameters).filter(
        ([k]) => handles.mixer_fields().includes(k)
    ).map(function (entry) {
        return utils.draw_range(
            dom,
            entry[0],
            entry[1].value,
            parameters.metadata[entry[0]].parameters[0]
        );
    });
    console.log(mixer);
    return [
        dom.header("header")(
            dom.button({
                id: "back",
                click: handles.back
            })("<=")
        ),
        dom.main("mixer")(
            ...mixer
        ),
        dom.footer("footer")(
            dom.div("battery")(parameters.battery.value + "% 🔋")
        )
    ];
});
