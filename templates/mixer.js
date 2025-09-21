/*jslint browser, unordered*/


export default  Object.freeze(function (dom, guitar) {
    return dom.button({id: "connect", "click": guitar.connect})("Connect");

});

