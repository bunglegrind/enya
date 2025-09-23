/*jslint browser, devel, unordered*/
const guitar = {
    name: "NOVA Go Sonic System",
    service: 0xab11,
    opcodes: {
        battery: 0x11,
        autoshutdown: 0x0e,
        preset: 0x0c,
        mixer: [0x00, 0x01, 0x02, 0x03, 0x04, 0x05],
        effects: [0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]
    },
    mixer_length: 0,
    effects_length: 1
};
let drawer;
let connected = false;

function connect() {
    connected = true;
    drawer.update({connected: true});
}

function ask(prop) {
    drawer.update({
        battery: 50,
        autoshutdown: 0,
        preset: {
            switch: 0,
            offsets: [0, 0, 0, 0]
        },
        // effects: {
        //     amp: {
        //         type: 0, //0-clean; 1-distorted
        //         status: 1, //on-off
        //         volume: 0, //preamp for distorted channel
        //         master: 0,
        //         bass: 0,
        //         middle: 0,
        //         treble: 0,
        //         presence: 0 //only on distorted - check if trasmitted when type is zero!
        //     },
        //     eq: {
        //         status: 1, //on-off
        //         pregain: 0, //0-12
        //         hz80: 0, //0-24
        //         hz240: 33, //0-24
        //         hz750: 34, //0-24
        //         hz2200:12, //0-24
        //         hz6600: 0xc2 //0-24
        //     },
        //     modulation: {
        //         status: 1, //on-off
        //         type: 0,
        //         rate: 2,
        //         depth: 0x54
        //     }
        // }
    });

}


function set_drawer(d) {
    drawer = d;
}

function disconnect() {
    if (connected) {
        connected = false;
        drawer.init();
    }
}

function set_shutdown(event) {
    drawer.update({
        autoshutdown: Number(event.currentTarget.getAttribute("data"))
    });
}

function set_preset({currentTarget}) {
    const position = currentTarget.getAttribute("data-row");
    const offset = currentTarget.getAttribute("data-element");

    const preset = drawer.retrieve("preset");

    drawer.update({
        preset: {
            switch: Number(position),
            offsets: preset.offsets.with(position, Number(offset))
        }
    });
}

function edit() {
    drawer.update({
        effects: {
            amp: {
                type: 0, //0-clean; 1-distorted
                status: 1, //on-off
                volume: 0, //preamp for distorted channel
                master: 0,
                bass: 0,
                middle: 0,
                treble: 0,
                presence: 0 //only on distorted - check if trasmitted when type is zero!
            }
        }
    });
}

navigator.bluetooth.requestDevice();

export default Object.freeze({
    connect,
    ask,
    set_drawer,
    disconnect,
    reset: disconnect,
    set_shutdown,
    set_preset,
    edit,
    get_effects_length: () => guitar.effects_length,
    get_mixer_length: () => guitar.mixer_length,

});
