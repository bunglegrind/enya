/*jslint browser, unordered*/
import utils from "../utils.js";


export default Object.freeze(function (state, dom, guitar) {
    function popup(prompt, cb) {
        function disable(event) {
            const popup = document.body.querySelector("#popup");
            if (popup) {
                event.stopImmediatePropagation();
                document.querySelector("#app").classList.remove("shadow");
                document.body.querySelector("#popup").remove();
                document.querySelector("#app").removeEventListener("click", disable, true);
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
                        click: function (event) {
                            const popup = event.currentTarget.parentElement.parentElement;
                            let name = popup.querySelector("input").value;
                            if (name) {
                                popup.remove();
                                document.querySelector("#app").classList.remove("shadow");
                                document.querySelector("#app").removeEventListener("click", disable, true);
                                cb(name);
                            }
                        }
                    })("Confirm"),
                    dom.button({click: function (event) {
                            const popup = event.currentTarget.parentElement.parentElement;
                            document.querySelector("#app").classList.remove("shadow");
                            document.querySelector("#app").removeEventListener("click", disable, true);
                            popup.remove();
                        }}
                    )("Cancel")
                )
            )
        );
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
            dom.button({
                id: "load",
                click: utils.load
            })("Load"),
            dom.button({
                id: "undo",
                click: utils.load
            })("Undo"),
            dom.button({
                id: "mixer",
                click: guitar.mixer
            })("⚙")
        ),
        dom.main("effects")(JSON.stringify(state))
    ];
});
