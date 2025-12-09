/*jslint browser, devel, unordered*/

import guitar from "./sonic-settings.js";
import message_helper from "./message-helper.js";

function g(device) {


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
        const response = message_helper.toArray(value);

        message_helper.validate(response);

        console.log("Received: ", response);

        if (response[4] === guitar.commands.battery.opcode) {
            return drawer.update({battery: response[5]});
        }
        if (response[4] === guitar.commands.autoshutdown.opcode) {
            return drawer.update({autoshutdown: response[5]});
        }
        if (response[4] === guitar.commands.preset.opcode) {
            return drawer.update(
                {preset: {switch: response[5], offsets: response.slice(6, 10)}}
            );
        }
        const effects_opcodes = Object.values(guitar.commands).filter(
            (v) => v.group === "effects"
        ).map((a) => a.opcode);
        if (effects_opcodes.includes(response[4])) {
            const effects = Object.assign({}, drawer.retrieve("effects"));
            const effect = Object.entries(guitar.commands).find(
                ([ignore, v]) => v.opcode === response[4] //jslint-ignore-line
            );
            effects[effect[0]] = response.slice(5, response.length - 3);
            return drawer.update({
                effects
            });
        }
        const mixer_opcodes = Object.values(guitar.commands).filter(
            (v) => v.group === "mixer"
        );

        if (mixer_opcodes.includes(response[4])) {
            const mixer = Object.assign({}, drawer.retrieve("mixer"));
            const volume = Object.entries(guitar.commands).find(
                ([ignore, v]) => v.opcode === response[4] //jslint-ignore-line
            );
            mixer[volume[0]] = response.slice(5, response.length - 3);
            return drawer.update({
                mixer
            });
        }
    }

    async function set_shutdown(event) {
        const selection = Number(event.currentTarget.getAttribute("data"));
        await send([0x00, guitar.commands.autoshutdown.opcode, selection]);
    }

    async function set_preset({currentTarget}) {
        const position = Number(currentTarget.getAttribute("data-row"));
        const offset = Number(currentTarget.getAttribute("data-element"));

        const preset = drawer.retrieve("preset");
        await send([
            0x00,
            guitar.commands.preset.opcode,
            position,
            ...preset.offsets.with(position, offset)
        ]);
    }

    async function edit_preset() {
        await send([
            0x10,
            guitar.commands.amp.opcode
        ]);
    }

    async function mixer() {
        await send([
            0x10,
            guitar.commands.guitar.opcode
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
            message.toBuffer(full_message)
        );
    }

    function validate(preset, guitar) {
        return guitar && preset;
    }

    async function load_preset(preset) {
        const effects = Object.values(guitar.commands).filter(
            (a) => a.group === "effects"
        );
        if (
            !validate(
                preset,
                effects
            )
        ) {
            return "File not compatible";
        }

        Object.keys(effects);

        return await "File loaded";
    }

    async function ask(prop, par_offset) {
        const groups = Object.values(guitar.commands).reduce(
            (acc, item) => (
                (item.group && !acc.includes(item.group))
                ? [...acc, item.group]
                : acc
            ),
            []
        );
        if (
            !Object.keys(guitar.commands).includes(prop)
            && !groups.includes(prop)
        ) {
            throw new Error(`Prop name not valid: ${prop}`);
        }

        const m = [0x10];

        if (groups.includes(prop)) {
            m.push(
                Object.values(guitar.commands).find(
                    (a) => a.group === prop && a.offset === par_offset
                ).opcode
            );
        } else {
            m.push(guitar.commands[prop].opcode);
        }

        await send(m);
    }

    function back() {
        drawer.update({effects: undefined, mixer: undefined});
    }

    function get_group_elements(group) {
        return Object.values(guitar.commands).filter(
            (v) => v.group === group
        ).length;
    }

    return Object.freeze({
        connect,
        ask,
        set_drawer,
        disconnect: device.disconnect,
        reset: device.disconnect,
        set_shutdown,
        set_preset,
        load_preset,
        get_effects_length: () => get_group_elements("effects"),
        get_mixer_length: () => get_group_elements("mixer"),
        edit_preset,
        mixer,
        back
    });
}

export default Object.freeze(g);
