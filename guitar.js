/*jslint browser, unordered*/
const guitar = {
    name: "NOVA Go Sonic System",
    service: 0xab11,
};

let server;
let app_state = {};

function cleanUp() {

}

async function connect() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{name: guitar.name}],
            optionalServices: [guitar.service, 0x1801, 0x1800]
        });
    server = await device.gatt.connect();
    device.addEventListener("gattserverdisconnected", cleanUp);
    } catch (e) {
        console.log("ERROR", e);
    }
}

async function ask({prop, state}) {
    //if not connected, error

}

async function order() {

}

async function receive() {

}

export default Object.freeze({
    connect,
    ask,
    order
});
