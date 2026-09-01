/*jslint browser, devel, unordered*/
let notifier;
let writer;
let server;
let custom_service;
let event_handle;

function connect({name, service, cleanUp}) {
    return navigator.bluetooth.requestDevice({
        filters: [{name}],
        optionalServices: [service, 0x1801, 0x1800]
    }).then(function (device) {
        server = device.gatt;
        device.addEventListener("gattserverdisconnected", function clean() {
            cleanUp();
            notifier.removeEventListener(
                "characteristicvaluechanged",
                event_handle
            );
            return device.removeEventListener(
                "gattserverdisconnected",
                clean
            );

        });
        custom_service = service;

        return server.connect();
    });
}

function start_notifications(handle) {
    return server.getPrimaryService(custom_service).then(
        function (service) {
            return service.getCharacteristics();
        }
    ).then(function (chars) {
        notifier = chars.find((c) => c.properties.notify);
        writer = chars.find((c) => c.properties.writeWithoutResponse);
        event_handle = handle;
        notifier.addEventListener(
            "characteristicvaluechanged",
            handle
        );
        return notifier.startNotifications();
    });
}

function disconnect() {
    if (server?.connected) {
        server.disconnect();
    }
}

function write(buffer) {
    return writer.writeValueWithoutResponse(
        buffer
    );
}

export default Object.freeze({
    connect,
    disconnect,
    write,
    start_notifications
});

