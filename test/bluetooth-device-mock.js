/*jslint browser, devel, unordered*/
import message_factory from "../message.js";
import sonic from "../sonic-settings.js";

const msg_builder = message_factory(sonic.messages);

let handle_notifications;
let clean;

const guitar_mock = {
    battery: {value: 50},
    autoshutdown: {value: 0},
    preset: {
        switch: 2,
        "offset-0": 0,
        "offset-1": 0,
        "offset-2": 1,
        "offset-3": 0
    }
};

function connect({cleanUp}) {
    clean = cleanUp;

    return new Promise(function (resolve) {
        setTimeout(resolve, 0);
    });
}

function disconnect() {
    if (typeof clean === "function") {
        const c = clean;
        clean = undefined;
        c();
    }
}

function write(buffer) {
    const msg = msg_builder.from(buffer);
    let encoded_message;

    const type = msg.get_type();

    const element = msg.get_msg();
    console.log(element);

    if (type === "put") {
        guitar_mock[element] = msg.get_parameters();
        console.log(guitar_mock[element]);
        encoded_message = msg_builder.response(
            element,
            guitar_mock[element]
        ).toArray();
    }

    if (type === "query") {
        encoded_message = msg_builder.response(
            element,
            guitar_mock[element]
        ).toArray();
    }

    const event = Object.create(null);
    event.target = Object.create(null);
    event.target.value = new DataView(Uint8Array.from(encoded_message).buffer);

    return new Promise(function (resolve) {
        setTimeout(resolve, 0);
    }).then(function () {
        handle_notifications(event);
    });
}

function start_notifications(handle) {
    handle_notifications = handle;

    return new Promise(function (resolve) {
        setTimeout(resolve, 0);
    });
}

export default Object.freeze({
    connect,
    disconnect,
    write,
    start_notifications
});
