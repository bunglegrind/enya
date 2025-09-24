/*jslint browser, devel, unordered*/
let notifier;
let writer;
let server;
let custom_service;
async function connect({name, service, cleanUp}) {
    const device = await navigator.bluetooth.requestDevice({
        filters: [{name}],
        optionalServices: [service, 0x1801, 0x1800]
    });
    server = device.gatt;
    await server.connect();
    device.addEventListener("gattserverdisconnected", cleanUp);
    custom_service = service;
}

async function start_notifications(handle) {
    const service = await server.getPrimaryService(custom_service);
    const chars = await service.getCharacteristics();

    notifier = chars.find((c) => c.properties.notify);
    writer = chars.find((c) => c.properties.writeWithoutResponse);

    await notifier.startNotifications();

    notifier.addEventListener(
        "characteristicvaluechanged",
        handle
    );

}
function disconnect() {
    if (server?.connected) {
        server.disconnect();
    }
}

async function write(buffer) {
    return await writer.writeValueWithoutResponse(
        buffer
    );
}

Object.freeze({
    connect,
    disconnect,
    write,
    start_notifications
});

