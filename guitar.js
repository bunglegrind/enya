/*jslint browser, devel, unordered*/

import guitar from "./sonic-parameters.js";
import message_factory from "./message.js";
import pubsub from "./lib/pubsub.js";
import cache_factory from "./lib/store.js";

const timeout = 1000;

function guitar_factory(device) {
    const external_pubsub = pubsub();


    const message_builder = message_factory(guitar.messages);

    const effects = ["amp", "eq", "noise", "mod", "delay", "reverb"];
    const mixer = ["guitar", "otg", "box", "line", "ear", "bluetooth"];

    let state = cache_factory(
        {effects, mixer}
    );

    let listener;

    let preset_operation_pending = false;
    let global_clean_send;
    function clean(client_clean) {
        client_clean();
        external_pubsub.removeListener("ConnectionLost", disconnect);
        external_pubsub.removeListener("PresetChanged", reset_effects);
        state.reset();
        preset_operation_pending = false;
        if (typeof global_clean_send === "function") {
            global_clean_send("Connection lost. Aborting");
        }
        global_clean_send = undefined;
        listener = undefined;
    }

    function disconnect() {
        device.disconnect();
    }
    external_pubsub.addListener("ConnectionLost", disconnect);

    function reset_effects() {
        return state.reset("effects");
    }
    external_pubsub.addListener("PresetChanged", reset_effects);

    function handleNotifications({target}) {
        const response = message_builder.from(target.value);

        console.log("Received: ", response.toArray());


        if (response.get_msg() === "preset") {
            reset_effects();
            if (!preset_operation_pending) {
                return external_pubsub.emit("PresetChanged", response);
            }
            preset_operation_pending = false;
        }


        if (typeof listener === "function") {
            return listener(response);
        }
    }

    function switch_preset(position, offset) {
        console.log(position, offset);

        return query("preset").then(function ({preset}) {
            preset[`offset-${position}`] = offset;
            preset.switch = position;

            return preset;
        }).then((new_offsets) => write("preset", new_offsets));
    }

    function connect(cleanUp) {
        return device.connect({
            name: guitar.name,
            service: guitar.service,
            cleanUp: clean(cleanUp)
        }).then(function () {
            return device.start_notifications(handleNotifications);
        }).then(function () {
            return external_pubsub;
        });
    }

    let send_queue = [];
    let timeout_id;

    function send(m) {

        function add(to_send) {
            return send_queue.unshift(to_send);
        }

        function exec() {
            if (timeout_id !== undefined) {
                return;
            }

            if (!send_queue.length) {
                return;
            }

            const {message, resolve, reject} = send_queue.pop();
            console.log("sending ", message.toArray());

            function connection_lost() {
                external_pubsub.emit("ConnectionLost");

                return device.disconnect();
            }

            timeout_id = setTimeout(
                connection_lost,
                timeout
            );

            function clean_send(reason) {
                clearTimeout(timeout_id);
                timeout_id = undefined;
                listener = undefined;
                external_pubsub.removeListener(
                    "PresetChanged",
                    on_preset_changed
                );

                if (reason) {
                    reject(reason);
                    send_queue.forEach(function ({reject}) {
                        return reject(reason);
                    });
                    send_queue = [];
                }
            }

            function on_preset_changed() {
                const reason = "Preset switched. Aborting";
                return clean_send(reason);
            }

            function notify(incoming_message) {
                clean_send();
                if (incoming_message.get_msg() !== message.get_msg()) {
                    throw new Error(
                        "Wrong reply received",
                        {cause: {incoming_message, message}}
                    );
                }
                exec();

                return resolve(incoming_message);
            }
            external_pubsub.addListener(
                "PresetChanged",
                on_preset_changed
            );

            listener = notify;
            if (message.get_msg() === "preset") {
                preset_operation_pending = true;
            }
            global_clean_send = clean_send;

            return device.write(message.toBuffer());
        }

        const {promise, resolve, reject} = Promise.withResolvers();

        add({message: m, resolve, reject});
        exec();

        return promise;
    }

    function query(component) {
        // from cache
        const cached_value = state.read(component);
        if (cached_value !== undefined) {
            const obj = Object.create(null);
            obj[component] = cached_value;
            return Promise.resolve(obj);
        }

        return send(message_builder.query(component)).then(
            function (msg) {
                state.write(msg.get_msg(), msg.get_parameters());
                return query(component);

            }
        );
    }

    function write(component, parameters) {
        return send(message_builder.put(component, parameters)).then(
            function () {
                // to cache
                return state.write(component, parameters);
            }
        );
    }

    function update(component, parameters) {
        if (component === "preset") {
            throw new Error("preset cannot be updated");
        }

        let promise = Promise.resolve(true);

        if (effects.includes(component)) {
            promise = query(component).then(function (current_parameters) {
                parameters.status = current_parameters.status;
            });
        }

        return promise.then(function () {
            return write(component, parameters);
        });
    }

    function metadata(components = []) {
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
        meta.mixer = mixer;
        meta.effects = effects;

        return meta;
    }

    function enable(component) {
        if (!effects.includes(component)) {
            throw new Error(`${component} is not an effect`);
        }
        return query(component).then(function (value) {
            console.log(value);
            if (value[component].status) {
                return true;
            }
            return write(component, {...value[component], status: 1});
        }).then(() => true);

    }

    function disable(component) {
        if (!effects.includes(component)) {
            throw new Error(`${component} is not an effect`);
        }
        return query(component).then(function (value) {
            if (!value[component].status) {
                return true;
            }
            return write(component, {...value[component], status: 0});
        }).then(() => true);
    }

    function addListener(type, listener) {
        return external_pubsub.addListener(type, listener);
    }

    function removeListener(type, listener) {
        return external_pubsub.removeListener(type, listener);
    }

    function get(components) {
        return Promise.all(
            components.map((component) => query(component))
        ).then(function (values) {

            return values.reduce(function (obj, item) {
                return {...obj, ...item};
            }, {});
        });
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
