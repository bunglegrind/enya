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

screens.effect = [
    "battery",
    "autoshutdown"
];

const labels = {
    guitar: "Guitar output",
    otg: "USB input",
    bluetooth: "Bluetooth input",
    box: "Speaker output",
    ear: "jack 3.5mm output",
    line: "jack 6.5 output",
    amp: "Amplifier",
    eq: "Equalizer",
    mod: "Modulator",
    noise: "Noise gate",
    delay: "Delay",
    reverb: "Reverb",
    "volume/preamp": "Preamp",
    master: "Master",
    bass: "Bass",
    middle: "Middle",
    treble: "Treble",
    presence: "Presence",
    pregain: "Pregain",
    hz80: "80 Hz",
    hz240: "240 Hz",
    hz750: "750 Hz",
    hz2200: "2200 Hz",
    hz6600: "6600 Hz",
    depth: "Depth",
    rate: "Rate",
    threshold: "Threshold",
    attack: "Attack",
    release: "Release",
    hold: "Hold",
    time: "Time",
    level: "Level",
    feedback: "Feedback",
    decay: "Decay"
};

export default Object.freeze({screens, labels});

