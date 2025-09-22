/*jslint browser, devel, unordered*/
const guitar = {
    name: "NOVA Go Sonic System",
    service: 0xab11,
    opcodes: {
        battery: 0x11,
        autoshutdown: 0x0e,
        preset: 0x0c,
        mixer: [0x00, 0x01, 0x02, 0x03, 0x04, 0x05],
        effects: [0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]
    },
    mixer_length: 6,
    effects_length: 6
};

let notifier;
let writer;

let drawer;

function set_drawer(d) {
    drawer = d;
}

function cleanUp() {
    console.log("Disconnetted");
    drawer.init();
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

    console.log("Received: ", response);

    if (response[4] === guitar.opcodes.battery) {
        return drawer.update({battery: response[5]});
    }
    if (response[4] === guitar.opcodes.autoshutdown) {
        return drawer.update({autoshutdown: response[5]});
    }
    if (response[4] === guitar.opcodes.preset) {

        return drawer.update(
            {preset: {switch: response[5], offsets: response.slice(6, 10)}}
        );
    }
}

let server;

function disconnect() {
    if (server?.connected) {
        server.disconnect();
    }
}

async function set_shutdown(event) {
    const selection = Number(event.currentTarget.getAttribute("data"));
    await send([0x00, guitar.opcodes.autoshutdown, selection]);
}

async function set_preset({currentTarget}) {
    const position = Number(currentTarget.getAttribute("data-row"));
    const offset = Number(currentTarget.getAttribute("data-element"));

    const preset = drawer.retrieve("preset");
    await send([
        0x00,
        guitar.opcodes.preset,
        position,
        ...preset.offsets.with(position, offset)
    ]);
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

        drawer.update({connected: true});

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
    console.log("sending ", full_message);
    await writer.writeValueWithoutResponse(
        Uint8Array.from(full_message)
    );
}

async function ask(prop) {
    if (!Object.keys(guitar.opcodes).includes(prop)) {
        throw new Error(`Opcode not valid: ${prop}`);
    }

    await send([0x10, guitar.opcodes[prop]]);
}

export default Object.freeze({
    connect,
    ask,
    set_drawer,
    disconnect,
    reset: disconnect,
    set_shutdown,
    set_preset,
    get_effects_length: () => guitar.effects_length,
    get_mixer_length: () => guitar.mixer_length,
});
