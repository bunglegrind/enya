/*jslint browser, devel, unordered*/
import message_factory from "../message.js";
import sonic from "../sonic-parameters.js";

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
    },
    amp: {
        status: 0,
        type: 0,
        "volume/preamp": 0,
        master: 0,
        bass: 0,
        middle: 0,
        treble: 0,
        presence: 0
    },
    eq: {
        status: 0,
        pregain: 0,
        hz80: 0,
        hz240: 0,
        hz750: 0,
        hz2200: 0,
        hz6600: 0
    },
    mod: {
        status: 0,
        type: 0,
        depth: 0,
        rate: 0
    },
    noise: {
        status: 0,
        threshold: 0,
        attack: 0,
        release: 0,
        hold: 0
    },
    delay: {
        status: 0,
        time: 0,
        level: 0,
        feedback: 0
    },
    reverb: {
        status: 0,
        level: 0,
        decay: 0
    },
    guitar: {
        value: 0
    },
    otg: {
        value: 0
    },
    bluetooth: {
        value: 0
    },
    box: {
        value: 0
    },
    ear: {
        value: 0
    },
    line: {
        value: 0
    },
    effects: (new Array(16).fill({}))
};

const effects = ["amp", "eq", "noise", "mod", "reverb", "delay"];

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

    const preset = (
        guitar_mock.preset.switch * 4
        + guitar_mock.preset[`offset-${guitar_mock.preset.switch}`]
    );
    if (type === "put") {
        if (!effects.includes(element)) {
            guitar_mock[element] = msg.get_parameters();
            console.log(guitar_mock[element]);
            encoded_message = msg_builder.response(
                element,
                guitar_mock[element]
            ).toArray();
        } else {
            guitar_mock[preset][element] = msg.get_parameters();
            console.log(guitar_mock[preset][element]);
            encoded_message = msg_builder.response(
                element,
                guitar_mock[preset][element]
            ).toArray();
        }
    }


    if (type === "query") {
        if (!effects.includes(element)) {
            encoded_message = msg_builder.response(
                element,
                guitar_mock[element]
            ).toArray();
        } else {
            encoded_message = msg_builder.response(
                element,
                guitar_mock.effects[preset][element] ?? guitar_mock[element]
            ).toArray();
        }
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
