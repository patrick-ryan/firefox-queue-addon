/**
 * display-tabs.js
 */

self.port.on("show", function(data) {
    var title = data[0];
    var url = data[1];
    console.log(title);
    var item = document.createElement("a");
    var href = document.createAttribute("href");
    // href.value = url;
    item.setAttributeNode(href);
    var text = document.createTextNode(title);
    item.appendChild(text);
    item.addEventListener("click", function() {
        self.port.emit("new-tab", url);
        self.port.emit("hide");
    });
    document.body.appendChild(item);
});

self.port.on("end", function() {
    // self.port.emit("hide");
});
