/*jslint browser, devel, unordered*/
const guitar = {
    name: "NOVA Go Sonic System",
    service: 0xab11,
    commands: {
        guitar: {
            opcode: 0x00,
            offset: 0,
            parameters: [{min: 0, max: 100}],
            group: "mixer"
        },
        otg: {
            opcode: 0x01,
            offset: 1,
            parameters: [{min: 0, max: 100}],
            group: "mixer"
        },
        bluetooth: {
            opcode: 0x02,
            offset: 2,
            parameters: [{min: 0, max: 100}],
            group: "mixer"
        },
        box: {
            opcode: 0x03,
            offset: 3,
            parameters: [{min: 0, max: 100}],
            group: "mixer"
        },
        ear: {
            opcode: 0x04,
            offset: 4,
            parameters: [{min: 0, max: 100}],
            group: "mixer"
        },
        line: {
            opcode: 0x05,
            offset: 5,
            parameters: [{min: 0, max: 100}],
            group: "mixer"
        },
        amp: {
            opcode: 0x06,
            offset: 0,
            parameters: [
                {name: "status", min: 0, max: 1},
                {name: "type", min: 0, max: 1},
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
                {name: "pregain", min: 0, max: 12},
                {name: "hz80", min: 0, max: 24},
                {name: "hz240", min: 0, max: 24},
                {name: "hz750", min: 0, max: 24},
                {name: "hz2200", min: 0, max: 24},
                {name: "hz6600", min: 0, max: 24}
            ],
            group: "effects"
        },
        mod: {
            opcode: 0x08,
            offset: 2,
            parameters: [
                {name: "status", min: 0, max: 1},
                {name: "type", min: 0, max: 2},
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
                {name: "time", min: 0, max: 600},
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
        battery: {opcode: 0x11, parameters: [{min: 0, max: 100}]},
        autoshutdown: {opcode: 0x0e, parameters: [{min: 0, max: 100}]},
        preset: {opcode: 0x0c, parameters: [
            {name: "switch", min: 0, max: 3},
            {name: "offset-0", min: 0, max: 3},
            {name: "offset-1", min: 0, max: 3},
            {name: "offset-2", min: 0, max: 3},
            {name: "offset-3", min: 0, max: 3}
        ]}
    }
};

export default Object.freeze(guitar);
