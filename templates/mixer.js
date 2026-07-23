/*jslint browser, unordered, fart*/

export default Object.freeze(function (state, dom, handles) {
    return [
        dom.header("header")(
            dom.button({
                id: "back",
                click: handles.back
            })("<=")
        ),
        dom.main("mixer")(JSON.stringify(Object.entries(state).filter(
            ([k]) => handles.mixer_fields().includes(k)
        ))),
        dom.footer("footer")(
            dom.div("battery")(state.battery + "% 🔋")
        )
    ];
});
