/*jslint browser, devel, unordered, fart*/

function extract(message) {
    return message.slice(3, message[2]);
}

function validatePacket(p) {
    if (
        p[0] !== 0xaa
        || p[1] !== 0x55
    ) {
        throw new Error("header error", {cause: p});
    }

    if ((p[2] < 3) || (p[2] + 3 !== p.length)) {
        throw new Error("length error", {cause: p});
    }
    if (
        p[p.length - 1] !== 0xaa
        || p[p.length - 2] !== 0x55
    ) {
        throw new Error("trailer error", {cause: p});
    }
    const parsSum = (p.slice(2, p.length - 3).reduce((x, y) => x + y)) % 256;
    if ((255 - parsSum) !== p[p.length - 3]) {
        throw new Error("checksum error", {cause: p});
    }

    return true;
}

const types = {
    query: 0x10,
    put: 0x00,
    response: 0x20
};

const inverted_types = Object.fromEntries(
    Object.entries(types).map(([k, v]) => [v, k])
);

function message_factory(messages) {
    const opcodes = Object.entries(messages).reduce(
        function (acc, item) {
            acc[item[1].opcode] = item[0];

            return acc;
        },
        {}
    );

    function validate_message(message) {
        if (!Object.keys(messages).includes(message)) {
            throw new Error(
                "Unknown message",
                {cause: message}
            );
        }

        return true;
    }

    function validate_parameters(parameters, message) {
        validate_message(message);

        const pars = messages[message].parameters;

        Object.entries(parameters).forEach(function ([par_name, value]) {
            const parameter = pars.find(({name}) => name === par_name);
            if (!parameter) {
                throw new Error(
                    "Unknown parameter",
                    {cause: JSON.stringify({par_name, message})}
                );
            }
            if (value < parameter.min || value > parameter.max) {
                throw new Error(
                    "Parameter out of range",
                    {cause: {name: par_name, value}}
                );
            }
        });

        return true;
    }

    function fromBuffer(buffer) {
        let array = [];
        let i = 0;
        while (i < buffer.byteLength) {
            array.push(buffer.getUint8(i));
            i += 1;
        }
        return fromArray(array);
    }

    function from(data) {
        if (Array.isArray(data)) {
            return fromArray(data);
        }

        return fromBuffer(data);
    }

    function build_msg({type, message, parameters}, serialized) {
        if (!Object.keys(types).includes(type)) {
            throw new Error("Message type unknown", {cause: serialized});
        }

        validate_message(message);

        function toArray() {
            const msg = messages[message];
            const opcode = messages[message].opcode;

            let m = [types[type], opcode];
            if (type !== "query") {
                msg.parameters.forEach(function (parameter) {
                    const parname = parameter.name;

// the presence parameter of the amp effect is not mandatory

                    if (parameters[parname] === undefined) {
                        return;
                    }
                    if (parameter.max < 0x100) {
                        m.push(parameters[parname]);
                    } else {
                        m.push(Math.floor(parameters[parname] / 0x100));
                        m.push(parameters[parname] % 0x100);
                    }
                });
            }
            const mess = [m.length + 3, ...m];
            const parity = 255 - ((mess.reduce((x, y) => x + y)) % 256);

            return [0xaa, 0x55, ...mess, parity, 0x55, 0xaa];
        }

        function toBuffer() {
            return new DataView(Uint8Array.from(toArray()).buffer);
        }

        function get_msg() {
            return message;
        }

        function get_parameters() {
            return parameters;
        }

        function get_type() {
            return type;
        }

        return Object.freeze({
            get_msg,
            toArray,
            toBuffer,
            get_parameters,
            get_type
        });

    }

    function fromArray(serialized) {
        validatePacket(serialized);
        const content = extract(serialized);
        const type = inverted_types[content[0]];
        const message = opcodes[content[1]];


        const pars = content.slice(2);


        let parameters;

        if (type !== "query") {
            parameters = Object.create(null);
            let i = 0;
            messages[message].parameters.forEach(
                function ({name, max, min}) {

// the presence parameter of the amp effect is not mandatory

                    if (pars[i] === undefined) {
                        return;
                    }
                    if (max < 256) {
                        name = name;
                        parameters[name] = pars[i];
                        if (pars[i] > max || pars[i] < min) {
                            throw new Error(
                                "Invalid message parameters",
                                {cause: {serialized, parameter: pars[i]}}
                            );
                        }
                        i += 1;
                        return;
                    }
                    parameters[name] = pars[i] * 256 + pars[i + 1];
                    if (
                        parameters[name] > max
                        || parameters[name] < min
                    ) {
                        throw new Error(
                            "Invalid message parameters",
                            {cause: {
                                serialized,
                                parameter: [pars[i], pars[i + 1]]
                            }}
                        );
                    }
                    i += 2;
                }
            );

            if (i >= content.length) {
                throw new Error(
                    "Invalid message length",
                    {cause: serialized}
                );
            }
        }
        const msg = build_msg({
            type,
            message,
            parameters
        }, serialized);

        return msg;

    }

    function query(message) {
        validate_message(message);

        return build_msg({
            message,
            type: "query"
        });
    }

    function put(message, parameters) {
        validate_parameters(parameters, message);

        return build_msg({
            message,
            type: "put",
            parameters
        });
    }

    function response(message, parameters) {
        validate_parameters(parameters, message);

        return build_msg({
            message,
            type: "response",
            parameters
        });
    }
    return Object.freeze({from, query, put, response});
}

export default Object.freeze(message_factory);
