/*jslint browser, unordered*/
import utils from "../utils.js";


export default Object.freeze(function (state, dom, guitar) {
    function popup(prompt, cb) {
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
        document.querySelector("#app").classList.add("shadow");
        document.querySelector("#app").addEventListener("click", disable, true);

        document.body.append(dom.div("popup")(
            dom.p("prompt")(prompt),
            dom.input({type: "text"}),
            dom.div({})(
                dom.button({
                    id: "Confirm",
                    click: function () {
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
                    }
                })("Confirm"),
                dom.button({click: function () {
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
                }})("Cancel")
            )
        ));
    }
    return [
        dom.header("header")(
            dom.button({
                id: "back",
                click: guitar.back
            })("<="),
            dom.button({
                id: "save",
                click: function (event) {
                    event.stopImmediatePropagation();
                    popup("Please enter a filename: ", function (name) {
                        utils.save(state.effects, name);
                    });
                }
            })("Save..."),
            dom.label({
                id: "load",
                click: utils.load
            })(dom.input({type: "file"}), "Load"),
            dom.button({
                id: "undo",
                change: utils.load
            })("Undo"),
            dom.button({
                id: "mixer",
                click: guitar.mixer
            })("⚙")
        ),
        dom.main("effects")(JSON.stringify(state))
    ];
});
