document.addEventListener('DOMContentLoaded', function() {
    reloadUI();
});

function reloadUI() {
    browser.runtime.sendMessage({ command: "showLink" })
        .then(response => {
            if (!response.data) {
                clearUI();
            } else {
                buildAppLinkUI(response.data)
            }

        })
        .catch(error => console.error("Error:", error));
}

function buildAppLinkUI(appLink) {
    const container = document.getElementById("content");
    container.innerHTML = "";
    title = document.createElement("h3")
    title.textContent = "Latest:";
    container.appendChild(title);
    var a;
    if (!appLink.url.includes("://")) { // Sometimes for the QR code we don't intercept links, still want to display it though
        a = document.createElement("u");
    } else {
        a = document.createElement("a");
        a.href = appLink.url;
    }
    if (appLink.url.length > 233) {
        a.textContent = appLink.url.substring(0, 230) + "...";
    } else {
        a.textContent = appLink.url;
    }
    container.appendChild(a);
    container.appendChild(document.createElement("br"));
    container.appendChild(document.createElement("br"));
    origin = document.createElement("b");
    origin.textContent = "Origin: ";
    container.appendChild(origin);
    originLink = document.createElement("a");
    originLink.textContent = appLink.origin;
    originLink.href = appLink.origin;
    container.appendChild(originLink);
    container.appendChild(document.createElement("br"));
    container.appendChild(document.createElement("br"));
    visited = document.createElement("b");
    visited.textContent = "Visited at: ";
    container.appendChild(visited);
    visitedDate = document.createElement("span");
    visitedDate.textContent = appLink.visitedAt;
    container.appendChild(visitedDate);
    browser.storage.local.get("history").then(
        (data) => {
            console.log(data);
            if (!data || !data.history) {
                count = 0;
            } else {
                count = JSON.parse(data.history).length;
            }
            setCount(count);
        },
        (err) => {
            console.log(`Error: ${err}`);
            setCount(0)
        }
    )
}

function setCount(c) {
    const count = document.getElementById("count");
    count.textContent = `${c}`;
}

function clearUI() {
    const container = document.getElementById("content");
    container.innerHTML = "<u>Empty</u>";
    setCount(0);
}

function setMessage(message) {
    m = document.getElementById("message");
    m.textContent = message;
    setTimeout(() => message.textContent = "", 2000);
}

document.getElementById('export').addEventListener('click', function() {
    browser.storage.local.get("history").then(
        (data) => {
            if (!data || !data.history || data.history.length === 0) {
                setMessage("No history to download");
                return;
            }
            var blob = new Blob([data.history], {type: "application/json"});
            var url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.href = url;
            link.download = "appLinksHistory.json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setMessage("History downloaded!");
        },
        (error) => {
            setMessage("No history to download");
        }
    );
});

document.getElementById('clear').addEventListener('click', async function() {
    setMessage("Cleared all data");
    clearUI();
    await browser.runtime.sendMessage({ command: "clearData" });
});

document.getElementById("qr").addEventListener("click", function () {
    chrome.tabs.captureVisibleTab(null, {}, function (imageString) {
        var canvasElement = document.getElementById("screenshot");
        var canvas = canvasElement.getContext("2d");
        var img = new Image();
        img.src = imageString;
        img.onload = function() {
            canvasElement.width = img.width;
            canvasElement.height = img.height;
            canvas.drawImage(img, 0, 0);

            var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            var code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            if (code) {
                console.log(code.data);
                browser.runtime.sendMessage({ command: "handleQrLink", data: code.data }).then((r) => reloadUI());
            } else {
                setMessage("Could not find QR code in page")
            }
        };
    });
})