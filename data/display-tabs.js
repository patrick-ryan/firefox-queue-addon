/**
 * display-tabs.js
 */

self.port.on("show", function(data) {
    var title = data[0];
    var url = data[1];
    // console.log("Showing: ", title);
    var elem = document.createElement("a");
    var cls = document.createAttribute("class");
    cls.value = "item";
    elem.setAttributeNode(cls);
    var href = document.createAttribute("href");
    // href.value = url;
    elem.setAttributeNode(href);
    var text = document.createTextNode(title);
    elem.appendChild(text);
    elem.addEventListener("click", function(event) {
        event.preventDefault();
        // console.log("Entry clicked: ", url);
        self.port.emit("entry-clicked", url);
        self.port.emit("hide");
    });
    document.body.appendChild(elem);
});