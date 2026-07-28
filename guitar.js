/*jslint browser, devel, unordered*/

import guitar from "./sonic-parameters.js";
import message_factory from "./message.js";
import pubsub from "./lib/pubsub.js";

const timeout = 1000;

function guitar_factory(device) {
    const external_pubsub = pubsub();
    const internal_pubsub = pubsub();


    const message_builder = message_factory(guitar.messages);

    const effects = ["amp", "eq", "noise", "mod", "delay", "reverb"];

    let state = Object.create(null);

    function handleNotifications(target) {
        const response = message_builder.from(target.value);

        console.log("Received: ", response.toArray());


        if (response.get_msg() === "preset") {
            external_pubsub.emit("PresetChanged", response);
        }


        return internal_pubsub.emit(
            "received",
            response
        );
    }

    async function set_shutdown(selection) {
        await send(
            message_builder.put("autoshutdown", {value: selection})
        );
    }

    async function switch_preset(position, offset) {
        console.log(position, offset);

        const new_offsets = {...state.preset};
        new_offsets[`offset-${position}`] = offset;
        new_offsets.switch = position;
        await send(
            message_builder.put(
                "preset",
                new_offsets
            )
        );
    }

    async function connect(cleanUp) {
        try {
            await device.connect({
                name: guitar.name,
                service: guitar.service,
                cleanUp
            });

            await device.start_notifications(handleNotifications);

            return external_pubsub;
        } catch (e) {
            console.log("ERROR", e);
        }
    }

    async function send(m) {
        console.log("sending ", m.toArray());
        await device.write(m.toBuffer());
    }

    function query(component) {
        return new Promise(function (resolve, reject) {
            let id;

            // from cache
            if (state[component] !== undefined) {
                return resolve(state[component]);
            }

            function switched() {
                clearTimeout(id);
                internal_pubsub.removeListener(get_value);
                external_pubsub.removeListener(switched);

                return reject("Preset switched. Aborting");
            }

            function abort() {
                external_pubsub.emit("ConnectionLost");
                internal_pubsub.removeListener(get_value);
                if (effects.includes(component)) {
                    external_pubsub.removeListener(switched);
                }
            }

            function get_value(value) {
                clearTimeout(id);
                if (value.get_msg() !== component) {
                    return reject(
                        `asking ${component} received ${value.get_msg()}`
                    );
                }
                internal_pubsub.removeListener(get_value);
                if (effects.includes(component)) {
                    external_pubsub.removeListener(switched);
                }

                state[component] = value;
                return resolve(value);
            }

            internal_pubsub.addListener(get_value);
            if (effects.includes(component)) {
                external_pubsub.addListener(switched);
            }
            return send(message_builder.query(component)).then(
                function () {
                    id = setTimeout(abort, timeout);
                }
            );
        });

    }

    function write(component, parameters) {
        return new Promise(function (resolve, reject) {
            let id;

            // to cache
            state[component] = parameters;

            function switched() {
                clearTimeout(id);
                internal_pubsub.removeListener(get_value);
                external_pubsub.removeListener(switched);

                return reject("Preset switched. Aborting");
            }

            function abort() {
                external_pubsub.emit("ConnectionLost");
                internal_pubsub.removeListener(get_value);
                if (effects.includes(component)) {
                    external_pubsub.removeListener(switched);
                }
            }

            function get_value(value) {
                clearTimeout(id);
                if (value.get_msg() !== component) {
                    return reject(
                        `asking ${component} received ${value.get_msg()}`
                    );
                }
                internal_pubsub.removeListener(get_value);
                if (effects.includes(component)) {
                    external_pubsub.removeListener(switched);
                }

                state[component] = value;
                return resolve(value);
            }

            internal_pubsub.addListener(get_value);
            if (effects.includes(component)) {
                external_pubsub.addListener(switched);
            }
            return send(message_builder.put(component, parameters)).then(
                function () {
                    id = setTimeout(abort, timeout);
                }
            );
        });
    }

    async function update(component, parameters) {
        return await "";
    }

    async function disconnect() {
        return await device.disconnect();
    }

    function metadata(components) {
        const meta = Object.create(null);

        components.forEach(function (component) {
            if (guitar.messages[component]) {
                meta[component] = Object.create(null);
                meta[component].parameters = (
                    guitar.messages[component].parameters
                );
                meta.offset = guitar.messages[component].offset;
            }
        });

        return meta;
    }

    async function enable(component) {
        if (!effects.includes(component)) {
            throw new Error(`${component} is not an effect`);
        }
        const parameters = await query(component);
        if (parameters.status) {
            return await true;
        }

        return await write(component, {...parameters, status: true});
    }

    async function disable(component) {
        if (!effects.includes(component)) {
            throw new Error(`${component} is not an effect`);
        }
        await query(component);

    }

    function addListener(type, listener) {
        return external_pubsub.addListener(type, listener);
    }

    function removeListener(type, listener) {
        return external_pubsub.removeListener(type, listener);
    }

    async function get(components) {
        return await "";

    }

    return Object.freeze({
        connect,
        update,
        enable,
        disable,
        switch_preset,
        get,
        disconnect,
        metadata,
        addListener,
        removeListener
    });
}

export default Object.freeze(guitar_factory);
