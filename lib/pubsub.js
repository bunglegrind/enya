/*jslint browser, devel, unordered*/




function factory() {
    let f;
    function replace(func) {
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
        replace,
        exec
    });


}

export default Object.freeze(factory);
