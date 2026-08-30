/*jslint browser, devel, unordered*/

function factory(groups) {
    let store;

    const groups_names = Object.keys(groups);

    function reset(group) {
        if (!group) {
            store = Object.create(null);
            groups_names.forEach(function (name) {
                store[name] = Object.create(null);
            });
        } else {
            store[group] = Object.create(null);
        }
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
        const toR = Object.create(null);
        const out = Object.entries(groups).find(
            function ([name, components]) {
                if (components.includes(component)) {
                    store[name][component] = value;
                    toR[component] = value;

                    return true;
                }
            }
        );

        if (out !== true) {
            store[component] = value;
            toR[component] = value;
        }


        return toR;
    }

    return Object.freeze({write, read, reset});

}

export default Object.freeze(factory);
