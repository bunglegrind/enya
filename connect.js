/*jslint browser, unordered*/
import guitar from "./guitar.js";


export default  Object.freeze(function (dom) {
    return dom.button({id: "connect", "click": guitar.connect})("Connect");

});