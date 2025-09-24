/*jslint browser, devel, unordered*/

function decode(buffer) {
    let response = [];
    let i = 0;
    while (i < buffer.byteLength) {
        response.push(buffer.getUint8(i));
        i += 1;
    }
    return response;
}

function encode(m) {
    const mess = [m.length + 3, ...m];
    const parity = 255 - ((mess.reduce((x, y) => x + y)) % 256);

    return [0xaa, 0x55, ...mess, parity, 0x55, 0xaa];
}

function validate(m) {
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
        || m[m.length - 2] !== 0x55
    ) {
        throw new Error("suffix error", {cause: m});
    }
    const parsSum = (m.slice(2, m.length - 3).reduce((x, y) => x + y)) % 256;
    if ((255 - parsSum) !== m[m.length - 3]) {
        throw new Error("checksum error", {cause: m});
    }
}

export default Object.freeze({encode, decode, validate});
