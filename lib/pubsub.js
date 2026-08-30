/*jslint browser, devel, unordered*/




function factory() {
    let subscribers = Object.create(null);
    function emit(type, value) {
        if (subscribers[type] === undefined) {
            subscribers[type] = [];
        }
        if (subscribers[type].length) {
            subscribers[type].forEach(function (f) {
                f(value);
            });

        }

        return value;
    }

    function addListener(type, listener) {
        subscribers[type] = [...(subscribers[type] ?? []), listener];

        return listener;
    }

    function removeListener(type, listener) {
        if (subscribers[type]) {
            subscribers[type] = subscribers[type].filter((s) => s !== listener);
        }

        return listener;
    }

    return Object.freeze({
        addListener,
        removeListener,
        emit
    });
}

export default Object.freeze(factory);
