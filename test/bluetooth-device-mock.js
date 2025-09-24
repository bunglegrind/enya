/*jslint browser, devel, unordered*/

import message_helper from "../message-helper.js";

let handle_notifications;
let clean;

const guitar_mock = {
    defaults: {
        0x11: [50],
        0x0e: [1],
        0x0c: [0, 0, 0, 0, 0],
        0x06: [1, 1, 10, 65, 23, 10, 30, 40],
        0x07: [1, 3, 18, 3, 5, 9, 22],
        0x08: [1, 2, 23, 82],
        0x09: [1, 12, 56, 89, 11],
        0x0a: [1, 0x01, 0x2c, 23, 14],
        0x0b: [0, 45, 78],
        0x00: [45],
        0x01: [45],
        0x02: [45],
        0x03: [45],
        0x04: [45],
        0x05: [45]
    }
}

function connect({cleanUp}) {
    clean = cleanUp;

    return new Promise(function (resolve) {
        setTimeout(resolve, 0);
    });
}

function disconnect() {
    if (typeof clean === "function") {
        clean();
    }
}

function write(buffer) {
    const command = Array.from(buffer);
    let encoded_message;

    if (command[3] === 0x00) {
        encoded_message = message_helper.encode([0x20, ...command.slice(4, command.length - 3)]);
    }

    if (command[3] === 0x10) {
        encoded_message = message_helper.encode([0x20, command[4], ...guitar_mock.defaults[command[4]]]);
    }

    const event = Object.create(null);
    event.target = Object.create(null);
    event.target.value = new DataView(Uint8Array.from(encoded_message).buffer);

    return new Promise(function (resolve) {
        setTimeout (resolve, 0);
    }).then(function () {
        handle_notifications(event);
    });
}

function start_notifications(handle) {
    handle_notifications = handle;

    return new Promise(function (resolve) {
        setTimeout (resolve, 0);
    });
}

export default Object.freeze({
    connect,
    disconnect,
    write,
    start_notifications
});

