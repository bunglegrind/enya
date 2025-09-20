/*jslint browser, unordered*/
import guitar from "./guitar.js";


export default Object.freeze(function (state, dom) {

    function highlight_active(props) {
        if (props.data !== state.autoshutdown) {
            return props;
        }

        return Object.assign({}, props, {class: "highlight"});
    }

    function highlight_element(props) {
        const offset = state.preset.offsets[props["data-row"]];
        if (props["data-element"] !== offset) {
            return props;
        }

        if (props["data-row"] === state.preset.switch) {
            return Object.assign({}, props, {class: "selected"});
        }

        return Object.assign({}, props, {class: "highlight"});
    }

    return [
        dom.header("header")(
            dom.button({
                id: "disconnect",
                click: guitar.disconnect
            })("Disconnect")
        ),
        dom.main("main")(
            dom.div(highlight_element({
                "data-row": 0,
                "data-element": 0,
                click: guitar.set_preset
            }))("0"),
            dom.div(highlight_element({
                "data-row": 0,
                "data-element": 1,
                click: guitar.set_preset
            }))("1"),
            dom.div(highlight_element({
                "data-row": 0,
                "data-element": 2,
                click: guitar.set_preset
            }))("2"),
            dom.div(highlight_element({
                "data-row": 0,
                "data-element": 3,
                click: guitar.set_preset
            }))("3"),
            dom.div(highlight_element({
                "data-row": 1,
                "data-element": 0,
                click: guitar.set_preset
            }))("0"),
            dom.div(highlight_element({
                "data-row": 1,
                "data-element": 1,
                click: guitar.set_preset
            }))("1"),
            dom.div(highlight_element({
                "data-row": 1,
                "data-element": 2,
                click: guitar.set_preset
            }))("2"),
            dom.div(highlight_element({
                "data-row": 1,
                "data-element": 3,
                click: guitar.set_preset
            }))("3"),
            dom.div(highlight_element({
                "data-row": 2,
                "data-element": 0,
                click: guitar.set_preset
            }))("0"),
            dom.div(highlight_element({
                "data-row": 2,
                "data-element": 1,
                click: guitar.set_preset
            }))("1"),
            dom.div(highlight_element({
                "data-row": 2,
                "data-element": 2,
                click: guitar.set_preset
            }))("2"),
            dom.div(highlight_element({
                "data-row": 2,
                "data-element": 3,
                click: guitar.set_preset
            }))("3"),
            dom.div(highlight_element({
                "data-row": 3,
                "data-element": 0,
                click: guitar.set_preset
            }))("0"),
            dom.div(highlight_element({
                "data-row": 3,
                "data-element": 1,
                click: guitar.set_preset
            }))("1"),
            dom.div(highlight_element({
                "data-row": 3,
                "data-element": 2,
                click: guitar.set_preset
            }))("2"),
            dom.div(highlight_element({
                "data-row": 3,
                "data-element": 3,
                click: guitar.set_preset
            }))("3")
        ),
        dom.footer("footer")(
            dom.div("battery")(state.battery + "% 🔋"),
            dom.div("autoshutdown")(
                dom.span(
                    highlight_active(
                        {id: "0", data: 0, click: guitar.set_shutdown}
                    )
                )("0"),
                dom.span(
                    highlight_active(
                        {id: "15", data: 1, click: guitar.set_shutdown}
                    )
                )("15m"),
                dom.span(
                    highlight_active(
                        {id: "30", data: 2, click: guitar.set_shutdown}
                    )
                )("30m"),
                dom.span(
                    highlight_active(
                        {id: "45", data: 3, click: guitar.set_shutdown}
                    )
                )("45m")
            )
        )
    ];

});

