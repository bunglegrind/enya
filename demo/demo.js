const root = document.querySelector("#app");

const connectButton = document.createElement("button");
connectButton.append("Connetti");
root.appendChild(connectButton);

const disconnectButton = document.createElement("button");
disconnectButton.append("Disconnetti");
disconnectButton.disabled = true;
root.appendChild(disconnectButton);

const notificationDisplay = document.createElement("div");
root.appendChild(notificationDisplay);


const senderDiv = document.createElement("div");
const senderMessage = document.createElement("input");
senderMessage.type = "text";
senderDiv.appendChild(senderMessage);
const sendButton = document.createElement("button");
sendButton.append("Invia");
senderDiv.appendChild(sendButton);
let writer;

function prepareMessage(m) {
    const mess = [m.length + 3, ...m];
    const parity = 255 - ((mess.reduce((x, y) => x + y)) % 256);

    return [0xaa, 0x55, ...mess, parity, 0x55, 0xaa];
}

async function send(message) {
    const m = prepareMessage(message);
    validateMessage(m);
    await writer.writeValueWithoutResponse(
        Uint8Array.from(m)
    );
}

sendButton.addEventListener("click", function () {
    if (senderMessage.value && (senderMessage.value.length % 2 === 0)) {
        send(senderMessage.value.match(/[\da-fA-F]{1,2}/g).map((x) => parseInt("0x" + x)));
    }
});



const guitar = {
    name: "NOVA Go Sonic System",
    service: 0xab11,
};

let server;

let notifier;

function toggle(button) {
    button.disabled = !button.disabled;
}

function validateMessage(m) {
    if (
        m[0] !== 0xaa
        || m[1] !== 0x55
    ) {
        throw new Error("prefix error", {cause: m});
    }

    if ((m[2] < 3) || (m[2] + 3 !== m.length)) {
        throw new Error("length error", {cause: m});
    }
    if (
        m[m.length - 1] !== 0xaa
        || m[m.length - 2] !==0x55
    ) {
        throw new Error("suffix error", {cause: m});
    }
    const parsSum = (m.slice(2, m.length - 3).reduce((x, y) => x + y)) % 256;
    if ((255 - parsSum) !== m[m.length - 3]) {
        throw new Error("checksum error", {cause: m});
    }
}

function printResponse(response) {
    notificationDisplay.textContent = response.map((x) => x.toString(16).padStart(2, "0")).join(" ");
}


function handleNotifications(event) {
    let value = event.target.value;

    let i = 0;

    let response = [];
    while (i < value.byteLength) {
        response.push(value.getUint8(i));
        i += 1;
    }

    validateMessage(response);

    printResponse(response);
}

async function getGuitarState() {}

//what happens if one of the two radios goes offline or outside the range?
connectButton.addEventListener("click", async function () {
    const device = await navigator.bluetooth.requestDevice({
        filters: [{name: guitar.name}],
        optionalServices: [guitar.service, 0x1801, 0x1800]
    });
    server = await device.gatt.connect();
    toggle(disconnectButton);
    toggle(connectButton);

    root.appendChild(senderDiv);
    device.addEventListener("gattserverdisconnected", cleanUp);

    const service = await device.gatt.getPrimaryService(guitar.service);
    const chars = await service.getCharacteristics();

    notifier = chars.find((c) => c.properties.notify);
    writer = chars.find((c) => c.properties.writeWithoutResponse);

    await notifier.startNotifications();

    notifier.addEventListener("characteristicvaluechanged", handleNotifications);

    guitar.state = await getGuitarState();

});

function cleanUp() {
    if (!server.connected) {
        return;
    }
    console.log("Device disconnetted");
    toggle(disconnectButton);
    toggle(connectButton);
    root.removeChild(senderDiv);
}

disconnectButton.addEventListener("click", async function () {
    cleanUp();
    server.disconnect();
});
