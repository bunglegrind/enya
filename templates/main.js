/*jslint browser, unordered, fart*/

export default Object.freeze(function (parameters, dom, handles) {

    const messages = parameters.metadata;

    function highlight_active(props) {
        if (props["data-value"] !== parameters.autoshutdown.value) {
            return props;
        }

        return Object.assign({}, props, {class: "highlight"});
    }

    function highlight_element(props) {
        const offset = parameters.preset[`offset-${props["data-row"]}`];
        if (props["data-element"] !== offset) {
            return props;
        }

        if (props["data-row"] === parameters.preset.switch) {
            return Object.assign({}, props, {class: "selected"});
        }

        return Object.assign({}, props, {class: "highlight"});
    }

    const preset_offsets = messages.preset.parameters.filter(
        ({name}) => name.startsWith("offset")
    );
    const switch_offsets = messages.preset.parameters.find(
        ({name}) => name === "switch"
    );


    return [
        dom.header("header")(
            dom.button({
                id: "disconnect",
                click: handles.disconnect
            })("Disconnect"),
            dom.button({
                id: "edit",
                click: handles.edit_preset
            })("Edit"),
            dom.button({
                id: "backup",
                click: handles.disconnect
            })("Backup"),
            dom.button({
                id: "restore",
                click: handles.disconnect
            })("Restore"),
            dom.button({
                id: "mixer",
                click: handles.mixer
            })("⚙")
        ),
        dom.main("main")(
            ...switch_offsets.labels.flatMap(
                function (ignore, i) {
                    return preset_offsets[i].labels.map(
                        function (offset_label, j) {
                            return dom.button(highlight_element({
                                "data-row": i,
                                "data-element": j,
                                click: handles.set_preset
                            }))(offset_label);
                        }
                    );
                }
            )
        ),
        dom.footer("footer")(
            dom.div("battery")(parameters.battery.value + "% 🔋"),
            dom.div("autoshutdown")(
                ...messages.autoshutdown.parameters[0].labels.map(
                    function (label, i) {
                        return dom.button(
                            highlight_active(
                                {
                                    id: label,
                                    "data-value": i,
                                    click: handles.set_shutdown
                                }
                            )
                        )(label);
                    }
                )
            )
        )
    ];

});

