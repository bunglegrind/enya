/*jslint browser, unordered, fart*/

export default Object.freeze(function (state, dom, guitar) {

    const messages = guitar.messages;

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
            })("Disconnect"),
            dom.button({
                id: "edit",
                click: guitar.edit_preset
            })("Edit"),
            dom.button({
                id: "backup",
                click: guitar.disconnect
            })("Backup"),
            dom.button({
                id: "restore",
                click: guitar.disconnect
            })("Restore"),
            dom.button({
                id: "mixer",
                click: guitar.mixer
            })("⚙")
        ),
        dom.main("main")(
            ...messages.preset.parameters.find(
                ({name}) => name === "swich"
            ).labels.map(
                function ({labels}) {
                    return labels.flatMap(function (switch_label) {
                        messages.preset.parameters.find(
                            ({name}) => name === `offset-${switch_label}`
                        ).labels.flatMap(function (offset_label) {
                            return dom.button(highlight_element({
                                "data-row": switch_label,
                                "data-element": offset_label,
                                click: guitar.set_preset
                            }))(offset_label);
                        });
                    });
                }
            )
        ),
        dom.footer("footer")(
            dom.div("battery")(state.battery + "% 🔋"),
            dom.div("autoshutdown")(
                ...messages.autoshutdown.labels.map(function (label, i) {
                    dom.button(
                        highlight_active(
                            {id: label, data: i, click: guitar.set_shutdown}
                        )
                    )(label);
                })
            )
        )
    ];

});

