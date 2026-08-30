/*jslint browser, unordered, fart*/

export default Object.freeze(function (parameters, dom, handles) {
    return [
        dom.header("header")(
            dom.button({
                id: "back",
                click: handles.back
            })("<=")
        ),
        dom.main("mixer")(JSON.stringify(Object.entries(parameters).filter(
            ([k]) => handles.mixer_fields().includes(k)
        ))),
        dom.footer("footer")(
            dom.div("battery")(parameters.battery.value + "% 🔋")
        )
    ];
});
