/*jslint browser, devel, unordered*/

import message_helper from "./message-helper.js";

function g(device) {
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
        const response = message_helper.decode(value);

        message_helper.validate(response);

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
            await device.connect({
                name: guitar.name,
                service: guitar.service,
                cleanUp
            });

            device.start_notifications(handleNotifications);

            drawer.update({connected: true});

        } catch (e) {
            console.log("ERROR", e);
        }
    }

    async function send(m) {
        const full_message = message_helper.encode(m);
        message_helper.validate(full_message);
        console.log("sending ", full_message);
        await device.write(
            Uint8Array.from(full_message)
        );
    }

    async function ask(prop) {
        if (!Object.keys(guitar.opcodes).includes(prop)) {
            throw new Error(`Opcode not valid: ${prop}`);
        }

        await send([0x10, guitar.opcodes[prop]]);
    }

    return Object.freeze({
        connect,
        ask,
        set_drawer,
        disconnect: device.disconnect,
        reset: device.disconnect,
        set_shutdown,
        set_preset,
        get_effects_length: () => guitar.effects_length,
        get_mixer_length: () => guitar.mixer_length
    });
}

export default Object.freeze(g);