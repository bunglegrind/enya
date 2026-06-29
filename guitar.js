/*jslint browser, devel, unordered*/

import guitar from "./sonic-settings.js";
import message_factory from "./message.js";

const groups = Object.values(guitar.messages).reduce(
    (acc, item) => (
        (item.group && !acc.includes(item.group))
        ? [...acc, item.group]
        : acc
    ),
    []
);


function g(device) {

    const message_builder = message_factory(guitar.messages);


    let drawer;

    function set_drawer(d) {
        drawer = d;
    }

    function cleanUp() {
        console.log("Disconnetted");
        drawer.init();
    }

    function handleNotifications(event) {
        const response = message_builder.from(event.target.value);

        console.log("Received: ", response.toArray());




        const state = Object.create(null);
        state[response.get_msg()] = (
            response.get_parameters().value ?? response.get_parameters()
        );

        return drawer.update(state);
        //mixer: [13, 134, 144...]
        //effects: [{}, ]

        const effects_opcodes = Object.values(guitar.messages).filter(
            (v) => v.group === "effects"
        ).map((a) => a.opcode);
        if (effects_opcodes.includes(response[4])) {
            const effects = Object.assign({}, drawer.retrieve("effects"));
            const effect = Object.entries(guitar.messages).find(
                ([ignore, v]) => v.opcode === response[4] //jslint-ignore-line
            );
            effects[effect[0]] = response.slice(5, response.length - 3);
            return drawer.update({
                effects
            });
        }
        const mixer_opcodes = Object.values(guitar.messages).filter(
            (v) => v.group === "mixer"
        );

        if (mixer_opcodes.includes(response[4])) {
            const mixer = Object.assign({}, drawer.retrieve("mixer"));
            const volume = Object.entries(guitar.messages).find(
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
        await send(
            message_builder.set("autoshutdown", {value: selection})
        );
    }

    async function set_preset({currentTarget}) {
        const position = Number(currentTarget.getAttribute("data-row"));
        const offset = Number(currentTarget.getAttribute("data-element"));

        const preset = drawer.retrieve("preset");
        const new_offsets = preset.offsets.with(position, offset);
        await send(
            message_builder.set(
                "preset",
                {
                    "switch": position,
                    "offset-0": new_offsets[0],
                    "offset-1": new_offsets[1],
                    "offset-2": new_offsets[2],
                    "offset-3": new_offsets[3]
                }
            )
        );
    }

    async function edit_preset() {
        await send(message_builder.query("amp"));
    }

    async function mixer() {
        await send(message_builder.query("guitar"));
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
        console.log("sending ", m.toArray());
        await device.write(m.toBuffer());
    }

    async function load_preset(preset) {
        const effects = Object.values(guitar.messages).filter(
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

    async function query(prop, par_offset) {
        if (
            !Object.keys(guitar.messages).includes(prop)
            && !groups.includes(prop)
        ) {
            throw new Error(`Prop name not valid: ${prop}`);
        }

        if (!groups.includes(prop)) {
            return await send(message_builder.query(prop));
        }

        await send(
            message_builder.query(
                Object.values(guitar.messages).find(
                    (a) => a.group === prop && a.offset === par_offset
                )
            )
        );
    }

    function back() {
        drawer.update({effects: undefined, mixer: undefined});
    }

    function get_group_elements(group) {
        return Object.values(guitar.messages).filter(
            (v) => v.group === group
        ).length;
    }

    return Object.freeze({
        connect,
        query,
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
        back,
        messages: guitar.messages
    });
}

export default Object.freeze(g);
