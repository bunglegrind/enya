/*jslint browser, unordered*/
import guitar from "./guitar.js";
import drawer_factory from "./drawer.js";
import device from "./bluetooth-device.js";

function init() {
    const root = document.querySelector("#app");
    const drawer = drawer_factory(root, document, guitar(device));
    drawer.init();
}
init();
