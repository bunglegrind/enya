/*jslint browser, unordered*/


export default Object.freeze(function (dom, handles) {
    return dom.button({id: "connect", "click": handles.connect})("Connect");

});
