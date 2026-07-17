/*jslint browser, devel, unordered*/

import guitar from "./sonic-parameters.js";
import message_factory from "./message.js";

function guitar_factory(device) {

    const message_builder = message_factory(guitar.messages);

    function handleNotifications(handler) {
        return function handle({target}) {
            const response = message_builder.from(target.value);

            console.log("Received: ", response.toArray());

            const state = Object.create(null);
            state[response.get_msg()] = (
                response.get_parameters().value ?? response.get_parameters()
            );

            return handler(state);
        };
    }

    async function set_shutdown(selection) {
        await send(
            message_builder.put("autoshutdown", {value: selection})
        );
    }

    async function set_preset(position, offset, preset) {
        console.log(position, offset);

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

    async function connect(handler, cleanUp) {
        try {
            await device.connect({
                name: guitar.name,
                service: guitar.service,
                cleanUp
            });

            await device.start_notifications(handleNotifications(handler));
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


    return Object.freeze({
        connect,
        query,
        disconnect: device.disconnect,
        reset: device.disconnect,
        set_shutdown,
        set_preset,
        load_preset,
        messages: guitar.messages
    });
}

export default Object.freeze(guitar_factory);
