/*jslint browser, devel, unordered*/

import message_helper from "./message-helper.js";

function g(device) {
    const guitar = {
        name: "NOVA Go Sonic System",
        service: 0xab11,
        commands: {
            guitar: {
                opcode: 0x00,
                offset: 0,
                parameters: [{min: 0, max: 100}],
                group: "mixer"
            },
            otg: {
                opcode: 0x01,
                offset: 1,
                parameters: [{min: 0, max: 100}],
                group: "mixer"
            },
            bluetooth: {
                opcode: 0x02,
                offset: 2,
                parameters: [{min: 0, max: 100}],
                group: "mixer"
            },
            box: {
                opcode: 0x03,
                offset: 3,
                parameters: [{min: 0, max: 100}],
                group: "mixer"
            },
            ear: {
                opcode: 0x04,
                offset: 4,
                parameters: [{min: 0, max: 100}],
                group: "mixer"
            },
            line: {
                opcode: 0x05,
                offset: 5,
                parameters: [{min: 0, max: 100}],
                group: "mixer"
            },
            amp: {
                opcode: 0x06,
                offset: 0,
                parameters: [
                    {name: "status", min: 0, max: 1},
                    {name: "type", min: 0, max: 1},
                    {name: "volume/preamp", min: 0, max: 100},
                    {name: "master", min: 0, max: 100},
                    {name: "bass", min: 0, max: 100},
                    {name: "middle", min: 0, max: 100},
                    {name: "treble", min: 0, max: 100},
                    {name: "presence", min: 0, max: 100}
                ],
                group: "effects"
            },
            eq: {
                opcode: 0x07,
                offset: 1,
                parameters: [
                    {name: "status", min: 0, max: 1},
                    {name: "pregain", min: 0, max: 100},
                    {name: "hz80", min: 0, max: 100},
                    {name: "hz240", min: 0, max: 100},
                    {name: "hz750", min: 0, max: 100},
                    {name: "hz2200", min: 0, max: 100},
                    {name: "hz6600", min: 0, max: 100}
                ],
                group: "effects"
            },
            mod: {
                opcode: 0x08,
                offset: 2,
                parameters: [
                    {name: "status", min: 0, max: 1},
                    {name: "type", min: 0, max: 2},
                    {name: "depth", min: 0, max: 100},
                    {name: "rate", min: 0, max: 100}
                ],
                group: "effects"
            },
            noise: {
                opcode: 0x09,
                offset: 3,
                parameters: [
                    {name: "status", min: 0, max: 1},
                    {name: "threshold", min: 0, max: 100},
                    {name: "attack", min: 0, max: 100},
                    {name: "release", min: 0, max: 100},
                    {name: "hold", min: 0, max: 100}
                ],
                group: "effects"
            },
            delay: {
                opcode: 0x0a,
                offset: 4,
                parameters: [
                    {name: "status", min: 0, max: 1},
                    {name: "time", min: 0, max: 600},
                    {name: "level", min: 0, max: 100},
                    {name: "feedback", min: 0, max: 100}
                ],
                group: "effects"
            },
            reverb: {
                opcode: 0x0b,
                offset: 5,
                parameters: [
                    {name: "status", min: 0, max: 1},
                    {name: "level", min: 0, max: 100},
                    {name: "decay", min: 0, max: 100}
                ],
                group: "effects"
            },
            battery: {opcode: 0x11, parameters: [{min: 0, max: 100}]},
            autoshutdown: {opcode: 0x0e, parameters: [{min: 0, max: 100}]},
            preset: {opcode: 0x0c, parameters: [
                {name: "switch", min: 0, max: 3},
                {name: "offset-0", min: 0, max: 3},
                {name: "offset-1", min: 0, max: 3},
                {name: "offset-2", min: 0, max: 3},
                {name: "offset-3", min: 0, max: 3}
            ]}
        }
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
            Uint8Array.from(full_message)
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
