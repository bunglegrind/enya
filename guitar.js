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
    }

    async function set_shutdown(event) {
        const selection = Number(event.currentTarget.getAttribute("data"));
        await send(
            message_builder.put("autoshutdown", {value: selection})
        );
    }

    async function set_preset({currentTarget}) {
        const position = Number(currentTarget.getAttribute("data-row"));
        const offset = Number(currentTarget.getAttribute("data-element"));
        console.log(position, offset);

        const preset = drawer.retrieve("preset");

        const new_offsets = {...preset};
        new_offsets[`offset-${position}`] = offset;
        new_offsets.switch = position;
        await send(
            message_builder.put(
                "preset",
                new_offsets
            )
        );
    }

    async function edit_preset() {
        return await drawer.update({effects: {}});
    }

    async function mixer() {
        return await drawer.update({mixer: {}});
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

    async function load_preset(ignore) {

        return await "File loaded";
    }

    async function query(prop) {
        if (!Object.keys(guitar.messages).includes(prop)) {
            throw new Error(`Prop name not valid: ${prop}`);
        }

        return await send(message_builder.query(prop));
    }

    async function group_query(group, par_offset) {
        if (!groups.includes(group)) {
            throw new Error(`Group name not valid: ${group}`);
        }

        console.log(guitar.messages);
        return await query(
            Object.entries(guitar.messages).find(
                (a) => a[1].group === group && a[1].offset === par_offset
            )[0]
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
        group_query,
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
