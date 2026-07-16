/*jslint browser, unordered*/

export default Object.freeze(function (state, dom, handles) {
    return [
        dom.header("header")(
            dom.button({
                id: "back",
                click: handles.back
            })("<=")
        ),
        dom.main("mixer")(JSON.stringify(state)),
        dom.footer("footer")(
            dom.div("battery")(state.battery + "% 🔋")
        )
    ];
});
