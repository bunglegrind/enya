/*jslint browser, devel, unordered*/
const guitar = {
    name: "NOVA Go Sonic System",
    service: 0xab11,
    messages: {
        guitar: {//guitar input volume
            opcode: 0x00,
            offset: 0,
            parameters: [{name: "value", min: 0, max: 100}],
            group: "mixer"
        },
        otg: {//usb output volume
            opcode: 0x01,
            offset: 1,
            parameters: [{name: "value", min: 0, max: 100}],
            group: "mixer"
        },
        bluetooth: {//bluetooth input volume
            opcode: 0x02,
            offset: 2,
            parameters: [{name: "value", min: 0, max: 100}],
            group: "mixer"
        },
        box: {//speaker output volume
            opcode: 0x03,
            offset: 3,
            parameters: [{name: "value", min: 0, max: 100}],
            group: "mixer"
        },
        ear: {//3.5mm jack output volume
            opcode: 0x04,
            offset: 4,
            parameters: [{name: "value", min: 0, max: 100}],
            group: "mixer"
        },
        line: {//6.35mm jack output volume
            opcode: 0x05,
            offset: 5,
            parameters: [{name: "value", min: 0, max: 100}],
            group: "mixer"
        },
        //status is on/off
        amp: {
            opcode: 0x06,
            offset: 0,
            parameters: [
                {name: "status", min: 0, max: 1},
                {name: "type", min: 0, max: 1, labels: ["clean", "distorted"]},
                {name: "volume/preamp", min: 0, max: 100},
                {name: "master", min: 0, max: 100},
                {name: "bass", min: 0, max: 100},
                {name: "middle", min: 0, max: 100},
                {name: "treble", min: 0, max: 100},
                {name: "presence", min: 0, max: 100}
            ],
            group: "effects"
        },
        eq: {
            opcode: 0x07,
            offset: 1,
            parameters: [
                {name: "status", min: 0, max: 1},
                {name: "pregain", min: 0, max: 12, offset: 6},
                {name: "hz80", min: 0, max: 24, offset: 12},
                {name: "hz240", min: 0, max: 24, offset: 12},
                {name: "hz750", min: 0, max: 24, offset: 12},
                {name: "hz2200", min: 0, max: 24, offset: 12},
                {name: "hz6600", min: 0, max: 24, offset: 12}
            ],
            group: "effects"
        },
        mod: {
            opcode: 0x08,
            offset: 2,
            parameters: [
                {name: "status", min: 0, max: 1},
                {name: "type", min: 0, max: 2, labels: [
                    "chorus", "tremolo", "vibrato"
                ]},
                {name: "depth", min: 0, max: 100},
                {name: "rate", min: 0, max: 100}
            ],
            group: "effects"
        },
        noise: {
            opcode: 0x09,
            offset: 3,
            parameters: [
                {name: "status", min: 0, max: 1},
                {name: "threshold", min: 0, max: 100},
                {name: "attack", min: 0, max: 100},
                {name: "release", min: 0, max: 100},
                {name: "hold", min: 0, max: 100}
            ],
            group: "effects"
        },
        delay: {
            opcode: 0x0a,
            offset: 4,
            parameters: [
                {name: "status", min: 0, max: 1},
                {name: "time", min: 0, max: 600},//two bytes
                {name: "level", min: 0, max: 100},
                {name: "feedback", min: 0, max: 100}
            ],
            group: "effects"
        },
        reverb: {
            opcode: 0x0b,
            offset: 5,
            parameters: [
                {name: "status", min: 0, max: 1},
                {name: "level", min: 0, max: 100},
                {name: "decay", min: 0, max: 100}
            ],
            group: "effects"
        },
        battery: {opcode: 0x11, parameters: [
            {name: "value", min: 0, max: 100}
        ]},
        autoshutdown: {opcode: 0x0e, parameters: [
            {name: "value", min: 0, max: 3, labels: ["0", "15m", "30m", "45m"]}
        ]},
        preset: {opcode: 0x0c, parameters: [
            {name: "switch", min: 0, max: 3, labels: ["0", "1", "2", "3"]},
            {name: "offset-0", min: 0, max: 3, labels: ["0", "1", "2", "3"]},
            {name: "offset-1", min: 0, max: 3, labels: ["0", "1", "2", "3"]},
            {name: "offset-2", min: 0, max: 3, labels: ["0", "1", "2", "3"]},
            {name: "offset-3", min: 0, max: 3, labels: ["0", "1", "2", "3"]}
        ]},
        unknown: {opcode: 0xff, parameters: [
            {name: "value", min: 0, max: 0}
        ]},//from app to guitar. At connection startup. Seems useless
        firmware: {opcode: 0x10, parameters: [
            {name: "firmware-0", min: 0, max: 255},
            {name: "firmware-1", min: 0, max: 255},
            {name: "firmware-2", min: 0, max: 255},
            {name: "firmware-3", min: 0, max: 255},
            {name: "firmware-4", min: 0, max: 255},
            {name: "firmware-5", min: 0, max: 255},
            {name: "firmware-6", min: 0, max: 255}
        ]},
        id: {opcode: 0x0f, parameters: [
            {name: "id-0", min: 0, max: 255},
            {name: "id-1", min: 0, max: 255},
            {name: "id-2", min: 0, max: 255},
            {name: "id-3", min: 0, max: 255},
            {name: "id-4", min: 0, max: 255},
            {name: "id-5", min: 0, max: 255},
            {name: "id-6", min: 0, max: 255},
            {name: "id-7", min: 0, max: 255},
            {name: "id-8", min: 0, max: 255}
        ]}
        //TODO: factory reset
        //TODO: firmware update
    }
};

export default Object.freeze(guitar);
