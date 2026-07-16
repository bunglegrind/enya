/*jslint browser, unordered*/

const screen = Object.create(null);

screen.connect = [];

screen.main = [
    "battery",
    "autoshutdown",
    "preset"
];

screen.effects = [
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

screen.mixer = [
    "battery",
    "autoshutdown",
    "guitar",
    "otg",
    "bluetooth",
    "box",
    "ear",
    "line"
];

export default Object.freeze(screen);

