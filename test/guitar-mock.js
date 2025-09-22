/*jslint browser, devel, unordered*/
let drawer;
let connected = false;

function connect() {
    connected = true;
    drawer.update({connected: true});
}

function ask() {
    drawer.update({
        battery: 50,
        autoshutdown: 0,
        preset: {
            switch: 0,
            offsets: [0, 0, 0, 0]
        },
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
            },
            eq: {
                status: 1,
                pregain: 0,
                hz80: 0,
                hz240: 33,
                hz750: 34,
                hz2200:12,
                hz6600: 0xc2
            },
            modulation: {
                status: 1,
                type: 0,
                rate: 2,
                depth: 0x54
            }
        }
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

export default Object.freeze({
    connect,
    ask,
    set_drawer,
    disconnect,
    reset: disconnect,
    set_shutdown,
    set_preset,
    edit
});
