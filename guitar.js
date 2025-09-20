/*jslint browser, devel, unordered*/
const guitar = {
    name: "NOVA Go Sonic System",
    service: 0xab11,
    opcodes: {
        battery: 0x11
    }
};

let app_state = {};
let notifier;
let writer;

let draw;

function set_drawer(d) {
    draw = d;
}

function cleanUp() {
    console.log("Disconnetted");
    app_state = {connected: false};
    draw(app_state);
}

function handleNotifications(event) {
    const value = event.target.value;

    let i = 0;

    let response = [];
    while (i < value.byteLength) {
        response.push(value.getUint8(i));
        i += 1;
    }

    validateMessage(response);

    if (response[4] === guitar.opcodes.battery) {
/*jslint-disable*/
        draw({...app_state, battery: Number(response[5])});
/*jslint-enable*/
    }
}

let server;

function disconnect() {
    server.disconnect();
    cleanUp();
}

async function connect() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{name: guitar.name}],
            optionalServices: [guitar.service, 0x1801, 0x1800]
        });
        server = device.gatt;
        await server.connect();
        device.addEventListener("gattserverdisconnected", cleanUp);
        const service = await device.gatt.getPrimaryService(guitar.service);
        const chars = await service.getCharacteristics();

        notifier = chars.find((c) => c.properties.notify);
        writer = chars.find((c) => c.properties.writeWithoutResponse);

        await notifier.startNotifications();

        notifier.addEventListener(
            "characteristicvaluechanged",
            handleNotifications
        );

        app_state = {connected: true};

        draw(app_state);

    } catch (e) {
        console.log("ERROR", e);
    }
}
function prepareMessage(m) {
    const mess = [m.length + 3, ...m];
    const parity = 255 - ((mess.reduce((x, y) => x + y)) % 256);

    return [0xaa, 0x55, ...mess, parity, 0x55, 0xaa];
}

function validateMessage(m) {
    if (
        m[0] !== 0xaa
        || m[1] !== 0x55
    ) {
        throw new Error("prefix error", {cause: m});
    }

    if ((m[2] < 3) || (m[2] + 3 !== m.length)) {
        throw new Error("length error", {cause: m});
    }
    if (
        m[m.length - 1] !== 0xaa
        || m[m.length - 2] !== 0x55
    ) {
        throw new Error("suffix error", {cause: m});
    }
    const parsSum = (m.slice(2, m.length - 3).reduce((x, y) => x + y)) % 256;
    if ((255 - parsSum) !== m[m.length - 3]) {
        throw new Error("checksum error", {cause: m});
    }
}


async function send(m) {
    const full_message = prepareMessage(m);
    validateMessage(full_message);
    await writer.writeValueWithoutResponse(
        Uint8Array.from(full_message)
    );
}

async function ask({prop, state}) { //jslint-ignore-line
/*jslint-disable*/
    app_state = {...state};
/*jslint-enable*/
    if (prop === "battery") {
        await send([0x10, guitar.opcodes.battery]);
    }

}

async function order() {
    return await 1;
}

async function receive() {
    return await 1;
}

export default Object.freeze({
    connect,
    ask,
    order,
    receive,
    set_drawer,
    disconnect
});
