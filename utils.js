/*jslint browser, unordered*/

function popup(dom, prompt, inner, buttons = 2) {
    if (!inner) {
        inner = Object.create(null);
        inner.element = dom.div({});
        inner.validate = () => true;
        inner.value = () => true;
    }
    function disable(element) {
        function disable_handler(event) {
            const container = document.body.querySelector("#popup");
            if (container) {
                event.stopImmediatePropagation();
                document.querySelector("#app").classList.remove("shadow");
                document.body.querySelector("#popup").remove();
                document.querySelector("#app").removeEventListener(
                    "click",
                    disable,
                    true
                );
            }
        }
        element.classList.add("shadow");
        element.addEventListener("click", disable_handler, true);

        return function enable() {
            document.querySelector("#app").classList.remove(
                "shadow"
            );
            document.querySelector("#app").removeEventListener(
                "click",
                disable_handler,
                true
            );
        };
    }

    const enable = disable(document.querySelector("#app"));
    const cancel_label = (
        buttons === 2
        ? "Cancel"
        : "OK"
    );

    return new Promise(function (resolve) {
        document.body.append(dom.div("popup")(
            dom.p("prompt")(prompt),
            inner.element,
            dom.div({})(
                (
                    buttons === 2
                    ? dom.button({
                        id: "Confirm",
                        click: function () {
                            if (inner.validate()) {
                                const container = (
                                    document.body.querySelector(
                                        "#popup"
                                    )
                                );
                                enable();
                                container.remove();
                                resolve(inner.value());
                            }
                        }
                    })("Confirm")
                    : ""
                ),
                dom.button({
                    click: function () {
                        const container = document.body.querySelector("#popup");
                        enable();
                        container.remove();
                        resolve(false);
                    },
                    id: cancel_label.toLowerCase()
                })(cancel_label)
            )
        ));
    });
}

export default Object.freeze({
    save: function (data, name) {
        const link = document.createElement("a");
        const file = new Blob(
            [JSON.stringify(data)],
            {type: "application/json"}
        );
        link.href = URL.createObjectURL(file);
        link.download = name;
        link.click();
        URL.revokeObjectURL(link.href);
    },
    load: async function (target) {
        const [file] = target.files;

        if (file) {
            return JSON.parse(await file.text());
        }
    },
    enter_name_popup: function enter_name_popup(dom, prompt) {
        const input = Object.create(null);
        input.element = dom.input({type: "text"});
        input.validate = function () {
            return input.element.value.length > 0;
        };
        input.value = function () {
            return input.element.value;
        };

        return popup(dom, prompt, input);
    },
    proceed_popup: function (dom, prompt) {
        return popup(dom, prompt);
    },
    confirm_popup: function (dom, prompt) {
        return popup(dom, prompt, undefined, 1);
    }
});
