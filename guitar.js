/*jslint browser, devel, unordered*/

import guitar from "./sonic-parameters.js";
import message_factory from "./message.js";
import pubsub from "./lib/pubsub.js";
import cache_factory from "./lib/cache.js";

const timeout = 1000;

function guitar_factory(device) {
    const external_pubsub = pubsub();
    const internal_pubsub = pubsub();


    const message_builder = message_factory(guitar.messages);

    const effects = ["amp", "eq", "noise", "mod", "delay", "reverb"];
    const mixer = ["guitar", "otg", "box", "line", "ear"];

    let state = cache_factory(
        {effects, mixer}
    );

    state.reset();

    let id;
    function abort() {
        external_pubsub.emit("ConnectionLost");
    }
    function handleNotifications(target) {
        if (id) {
            clearTimeout(id);
            id = undefined;
        }

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
        id = setTimeout(abort, timeout);
        await device.write(m.toBuffer());
    }

    function query(component) {
        return new Promise(function (resolve, reject) {

            // from cache
            const cached_value = state.read(component);
            if (cached_value !== undefined) {
                return resolve(cached_value);
            }

            function clean(message) {
                internal_pubsub.removeListener("received", get_value);
                external_pubsub.removeListener("PresetChanged", clean);
                external_pubsub.removeListener("ConnectionLost", clean);

            }

            function switched(message) {
                clean();

                return reject(message);
            }

            function get_value(value) {
                if (value.get_msg() !== component) {
                    return reject(
                        `asking ${component} received ${value.get_msg()}`
                    );
                }
                internal_pubsub.removeListener("received", get_value);
                external_pubsub.removeListener("PresetChanged", switched);

                state.write(component, value);
                return resolve(value);
            }

            internal_pubsub.addListener("received", get_value);
            external_pubsub.addListener(
                "PresetChanged",
                switched,
                "Preset switched. Aborting"
            );
            external_pubsub.addListener(
                "ConnectionLost",
                switched,
                "Connection Lost. Aborting"
            );

            return send(message_builder.query(component));
        });

    }

    function write(component, parameters) {
        return new Promise(function (resolve, reject) {

            // to cache
            state.write(component, parameters);

            function switched() {
                internal_pubsub.removeListener("received", get_value);
                external_pubsub.removeListener("PresetChanged", switched);

                return reject("Preset switched. Aborting");
            }

            function get_value(value) {
                if (value.get_msg() !== component) {
                    return reject(
                        `asking ${component} received ${value.get_msg()}`
                    );
                }
                internal_pubsub.removeListener("received", get_value);
                external_pubsub.removeListener("PresetChanged", switched);

                state.write(component, value);
                return resolve(value);
            }

            internal_pubsub.addListener("received", get_value);
            external_pubsub.addListener("ConnectionLost", function () {
                internal_pubsub.removeListener(get_value);
                if (effects.includes(component)) {
                    external_pubsub.removeListener(switched);
                }
            });
            if (effects.includes(component)) {
                external_pubsub.addListener(switched);
            }
            return send(message_builder.put(component, parameters));
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
