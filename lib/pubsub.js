/*jslint browser, devel, unordered*/




function factory() {
    let f;
    function set(func) {
        if (typeof func === "function") {
            f = func;
            return f;
        }

        throw new Error("func is not a function");
    }

    function exec(value) {
        return f(value);
    }

    return Object.freeze({
        set,
        exec
    });


}

export default Object.freeze(factory);
