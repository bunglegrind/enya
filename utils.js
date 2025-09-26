/*jslint browser, unordered*/

function disable(event) {
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
function popup(dom, prompt, inner, callback) {
    document.querySelector("#app").classList.add("shadow");
    document.querySelector("#app").addEventListener("click", disable, true);

    document.body.append(dom.div("popup")(
        dom.p("prompt")(prompt),
        inner,
        dom.div({})(
            dom.button({
                id: "Confirm",
                click: callback
            })("Confirm"),
            dom.button({
                click: function () {
                    const container = document.body.querySelector("#popup");
                    document.querySelector("#app").classList.remove(
                        "shadow"
                    );
                    document.querySelector("#app").removeEventListener(
                        "click",
                        disable,
                        true
                    );
                    container.remove();
                }
            })("Cancel")
        )
    ));

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
    enter_name_popup: function enter_name_popup(dom, prompt, cb) {
        popup(dom, prompt, dom.input({type: "text"}), function () {
            const container = document.body.querySelector(
                "#popup"
            );
            let name = container.querySelector("input").value;
            if (name) {
                container.remove();
                document.querySelector("#app").classList.remove(
                    "shadow"
                );
                document.querySelector("#app").removeEventListener(
                    "click",
                    disable,
                    true
                );
                cb(name);
            }
        });
    },
    proceed_popup: function (dom, prompt, cb) {
        popup(dom, prompt, dom.div({}), cb);
    }

});
