/*jslint browser, unordered*/
import guitar from "./guitar-mock.js";
import drawer_factory from "../drawer.js";

function init() {
    const root = document.querySelector("#app");
    const drawer = drawer_factory(root, document, guitar);
    drawer.init();
}
init();
