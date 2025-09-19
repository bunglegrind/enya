/*jslint browser, unordered*/
import drawer_factory from "./drawer.js";

function init() {
    const root = document.querySelector("#app");
    const drawer = drawer_factory(root, document);
    drawer.draw({connected: false});
}
init();