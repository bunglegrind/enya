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

export default Object.freeze({
    connect,
    ask,
    set_drawer,
    disconnect,
    reset: disconnect,
    set_shutdown,
    set_preset
});
