/*jslint browser, unordered*/

const screens = Object.create(null);

screens.connect = [];

screens.main = [
    "battery",
    "autoshutdown",
    "preset"
];

screens.effects = [
    "battery",
    "autoshutdown",
    "preset",
    "amp",
    "eq",
    "mod",
    "noise",
    "delay",
    "reverb"
];

screens.mixer = [
    "battery",
    "autoshutdown",
    "guitar",
    "otg",
    "bluetooth",
    "box",
    "ear",
    "line"
];

const labels = {
    guitar: "Guitar output",
    otg: "USB input",
    bluetooth: "Bluetooth input",
    box: "Speaker output",
    ear: "jack 3.5mm output",
    line: "jack 6.5 output"
};

export default Object.freeze({screens, labels});

