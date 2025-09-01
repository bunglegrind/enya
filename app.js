const root = document.querySelector("#app");

const button = document.createElement("button");
button.append("Cliccami");
root.appendChild(button);

button.addEventListener("click", function () {
    console.log("clicked");
    navigator.bluetooth.requestDevice({acceptAllDevices: true});
});
