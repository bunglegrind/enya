/*jslint browser, unordered*/

export default Object.freeze({
    save: function (event) {
        const link = document.createElement("a");
        const file = new Blob(["asdsadasd"], { type: 'text/plain' });
        link.href = URL.createObjectURL(file);
        link.download = "sample.txt";
        link.click();
        URL.revokeObjectURL(link.href);
    },
    load: () => {}
});
