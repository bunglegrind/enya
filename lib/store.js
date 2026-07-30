/*jslint browser, devel, unordered*/

function factory(groups) {
    let store;

    const groups_names = Object.keys(groups);

    function reset() {
        store = Object.create(null);
        groups_names.forEach(function (name) {
            store[name] = Object.create(null);
        });
    }

    function read(component) {
        const value = Object.entries(groups).find(
            function ([name, components]) {
                if (components.includes(component)) {
                    return store[name][component];
                }
            }
        );

        return value ?? store[component];
    }

    function write(component, value) {
        const out = Object.entries(groups).find(
            function ([name, components]) {
                if (components.includes(component)) {
                    store[name][component] = value;
                    return true;
                }
            }
        );

        if (out !== true) {
            store[component] = value;
        }

        return value;
    }

    return Object.freeze({write, read, reset});

}

export default Object.freeze(factory);
