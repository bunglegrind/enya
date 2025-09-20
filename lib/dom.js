/*jslint browser, unordered*/
/*property
    a, addEventListener, address, append, article, aside, b, blockquote, button,
    class, create, createElement, datalist, dd, div, dl, dt, em, entries,
    fieldset, figcaption, figure, footer, forEach, form, freeze, h1, h2, h3, h4,
    h5, h6, header, hr, i, id, img, input, isArray, join, label, legend, li,
    main, map, nav, ol, optgroup, option, p, search, section, select,
    setAttribute, span, strong, textarea, ul
*/

function domBuilder(document, prefix = "") {
    function attributeName(prop) {
        return (
            prefix
                ? `${prefix}-${prop}`
                : prop
        );
    }

    function dom(tag, ...nodes) {
        let node;
        if (typeof tag === "string") {
            node = document.createElement(tag);
        } else {
            if (
                !Array.isArray(tag)
                || typeof tag[0] !== "string"
                || typeof tag[1] !== "object"
            ) {
                throw new Error("dom: invalid first parameter");
            }
            node = document.createElement(tag[0]);
            Object.entries(tag[1]).forEach(function ([key, value]) {
                if (typeof value === "function") {
                    node.addEventListener(key, value);
                    return;
                }
                node.setAttribute(key, value);
            });
        }

// Elements with no children must be invoked

        node.append(...nodes.map((n) => (
            typeof n === "function"
                ? n()
                : n
        )));

        return node;
    }

    function normalizeIdClass(tag, props) {
        if (typeof props === "string") {
            return [tag, {id: attributeName(props)}];
        }

        const attrs = Object.create(null);
        if (props.id !== undefined) {
            attrs.id = attributeName(props.id);
        }
        if (props.class !== undefined) {
            const cn = (
                Array.isArray(props.class)
                    ? props.class
                    : [props.class]
            );
            attrs.class = cn.map((c) => attributeName(c)).join(" ");
        }

        /*jslint-disable*/
        return [tag, {...props, ...attrs}];
        /*jslint-enable*/

    }

    const specialize = (el) => (props = {}) => (...children) => dom(
        normalizeIdClass(el, props),
        ...children
    );
    const specializeVoid = (el) => (props) => dom(normalizeIdClass(el, props));

    return Object.freeze({
        h1: specialize("h1"),
        h2: specialize("h2"),
        h3: specialize("h3"),
        h4: specialize("h4"),
        h5: specialize("h5"),
        h6: specialize("h6"),
        header: specialize("header"),
        blockquote: specialize("blockquote"),
        i: specialize("i"),
        em: specialize("em"),
        b: specialize("b"),
        strong: specialize("strong"),
        div: specialize("div"),
        address: specialize("address"),
        article: specialize("article"),
        footer: specialize("footer"),
        main: specialize("main"),
        nav: specialize("nav"),
        aside: specialize("aside"),
        p: specialize("p"),
        ol: specialize("ol"),
        ul: specialize("ul"),
        li: specialize("li"),
        dd: specialize("dd"),
        dt: specialize("dt"),
        dl: specialize("dl"),
        figure: specialize("figure"),
        figcaption: specialize("figcaption"),
        span: specialize("span"),
        select: specialize("select"),
        button: specialize("button"),
        label: specialize("label"),
        legend: specialize("legend"),
        fieldset: specialize("fieldset"),
        form: specialize("form"),
        input: specializeVoid("input"),
        img: specializeVoid("img"),
        hr: specializeVoid("hr"),
        a: specialize("a"),
        textarea: specialize("textarea"),
        option: specialize("option"),
        optgroup: specialize("optgroup"),
        datalist: specialize("datalist"),
        search: specialize("search"),
        section: specialize("section")
    });
}

export default Object.freeze(domBuilder);
