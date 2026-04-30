let dynamicTable = [];
let encoded = [];

let originalSize = 0;
let compressedSize = 0;

let staticTable = [
    { name: ":method", value: "POST" },
    { name: ":method", value: "GET" },
    { name: ":method", value: "PUT" },
    { name: ":method", value: "DELETE" },
    { name: ":path", value: "/" },
    { name: ":scheme", value: "https" },
    { name: "accept", value: "*/*" },
    { name: "content-type", value: "application/json" }
];

//ENCODE
function encode() {
    let input = document.getElementById("inputHeader");
    let text = input.value.trim();
    if (!text) return;

    let [name, ...rest] = text.split(" ");
    let value = rest.join(" ");

    let size = name.length + value.length;
    originalSize += size;

    let sIndex = staticTable.findIndex(h => h.name === name && h.value === value);
    let dIndex = dynamicTable.findIndex(h => h.name === name && h.value === value);

    if (sIndex !== -1) {
        encoded.push({ type: "static", index: sIndex });
        compressedSize += 2;
    }

    else if (dIndex !== -1) {
        encoded.push({ type: "dynamic", index: dIndex });
        compressedSize += 2;
    }

    else {
        let shouldIndex = ["host", "user-agent"].includes(name);

        if (shouldIndex) {
            encoded.push({
                type: "literal-indexed",
                name,
                value,
                reason: "se guarda"
            });

            dynamicTable.unshift({ name, value });

        } else {
            encoded.push({
                type: "literal",
                name,
                value,
                reason: "no se guarda"
            });
        }

        compressedSize += size;
    }

    input.value = "";
    render();
}

//RENDER
function render() {
    let sent = document.getElementById("sent");
    let table = document.getElementById("table");
    let stats = document.getElementById("stats");

    sent.innerHTML = "";
    table.innerHTML = "";

    encoded.forEach(e => {
        let li = document.createElement("li");

        if (e.type === "static") li.textContent = `Static ${e.index}`;
        if (e.type === "dynamic") li.textContent = `Index ${e.index}`;
        if (e.type === "literal") li.textContent = `Literal ${e.name} ${e.value} (${e.reason})`;
        if (e.type === "literal-indexed") li.textContent = `Literal+ ${e.name} ${e.value} (${e.reason})`;

        sent.appendChild(li);
    });

    dynamicTable.forEach((h, i) => {
        let li = document.createElement("li");
        li.textContent = `${i}: ${h.name} = ${h.value}`;
        table.appendChild(li);
    });

    let ratio = originalSize > 0
        ? ((1 - compressedSize / originalSize) * 100).toFixed(2)
        : 0;

    stats.textContent = `Original: ${originalSize} | Comprimido: ${compressedSize} | Ahorro: ${ratio}%`;
}

//RESET
function resetAll() {
    dynamicTable = [];
    encoded = [];
    originalSize = 0;
    compressedSize = 0;
    render();
}

//EJEMPLOS
function exampleStatic() {
    let ex = [
        ":method POST",
        ":method GET",
        ":method PUT",
        ":method DELETE",
        ":path /",
        ":scheme https",
        "accept */*",
        "content-type application/json"
    ];
    document.getElementById("inputHeader").value =
        ex[Math.floor(Math.random() * ex.length)];
}

function exampleDynamic() {
    let ex = [
        "host example.com",
        "host google.com",
        "host facebook.com",
        "user-agent chrome",
        "user-agent firefox",
        "user-agent safari",
        "user-agent edge",
        "host amazon.com"
    ];

    document.getElementById("inputHeader").value =
        ex[Math.floor(Math.random() * ex.length)];
}

function exampleLiteral() {
    let ex = [
        "authorization token123",
        "cookie abc",
        "session id123",
        "x-key 999",
        "custom data",
        "tracking id999",
        "random value123",
        "api-key secret"
    ];
    document.getElementById("inputHeader").value =
        ex[Math.floor(Math.random() * ex.length)];
}

//DECODE
let decodeList = [];

function prepareDecodeStatic() {
    decodeList = encoded.filter(e => e.type === "static");
    renderDecodeInput();
}

function prepareDecodeDynamic() {
    decodeList = encoded.filter(e => e.type === "dynamic");
    renderDecodeInput();
}

function resetDecode() {
    decodeList = [];
    document.getElementById("decodeInput").innerHTML = "";
    document.getElementById("decodeOutput").innerHTML = "";
}

function renderDecodeInput() {
    let ul = document.getElementById("decodeInput");
    ul.innerHTML = "";

    decodeList.forEach(e => {
        let li = document.createElement("li");

        if (e.type === "static") li.textContent = `Static ${e.index}`;
        if (e.type === "dynamic") li.textContent = `Index ${e.index}`;

        ul.appendChild(li);
    });
}

function runDecode() {
    let tbody = document.getElementById("decodeOutput");
    tbody.innerHTML = "";

    decodeList.forEach(e => {
        let name, value;

        if (e.type === "static") {
            let s = staticTable[e.index];
            name = s.name;
            value = s.value;
        }

        if (e.type === "dynamic") {
            let d = dynamicTable[e.index];
            name = d.name;
            value = d.value;
        }

        let row = `<tr><td>${name}</td><td>${value}</td></tr>`;
        tbody.innerHTML += row;
    });
}