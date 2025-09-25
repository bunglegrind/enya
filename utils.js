/*jslint browser, unordered*/

export default Object.freeze({
    save: function (data, name) {
        const link = document.createElement("a");
        const file = new Blob(
            [JSON.stringify(data)],
            {type: "application/json"}
        );
        link.href = URL.createObjectURL(file);
        link.download = name;
        link.click();
        URL.revokeObjectURL(link.href);
    },
    load: () => 1
});
