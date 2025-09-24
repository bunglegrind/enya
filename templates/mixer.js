/*jslint browser, unordered*/

export default Object.freeze(function (state, dom, guitar) {
    return [
        dom.header("header")(
            dom.button({
                id: "back",
                click: guitar.back
            })("<=")
        ),
        dom.main("mixer")(JSON.stringify(state)),
        dom.footer("footer")(
            dom.div("battery")(state.battery + "% 🔋")
        )
    ];
});
