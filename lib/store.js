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
        let toR;
        Object.entries(groups).find(
            function ([name, components]) {
                if (components.includes(component)) {
                    toR = store[name][component];
                    return true;
                }
            }
        );

        return toR ?? store[component];
    }

    function write(component, value) {
        const found = Object.entries(groups).find(
            function ([name, components]) {
                if (components.includes(component)) {
                    store[name][component] = value;

                    return true;
                }
            }
        );

        if (found === undefined) {
            store[component] = value;
        }


        return value;
    }

    return Object.freeze({write, read, reset});

}

export default Object.freeze(factory);
