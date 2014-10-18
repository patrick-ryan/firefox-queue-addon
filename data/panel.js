/**
 * panel.js
 */

self.port.on("show", function(data) {
    var title = data[0];
    var url = data[1];
    // console.log("Showing: ", title);

    var item = document.createElement("div");
    var cls = document.createAttribute("class");
    cls.value = "item";
    item.setAttributeNode(cls);
    var link = document.createElement("a");
    var cls = document.createAttribute("class");
    cls.value = "link";
    link.setAttributeNode(cls);
    var href = document.createAttribute("href");
    link.setAttributeNode(href);
    var text = document.createTextNode(title);
    link.appendChild(text);
    link.addEventListener("click", function(event) {
        event.preventDefault();
        // console.log("Entry clicked: ", url);
        self.port.emit("item-clicked", url);
        self.port.emit("hide");
    });
    item.appendChild(link);
    var deq = document.createElement("a");
    var cls = document.createAttribute("class");
    cls.value = "deq";
    deq.setAttributeNode(cls);
    var href = document.createAttribute("href");
    deq.setAttributeNode(href);
    var text = document.createTextNode("X");
    deq.appendChild(text);
    deq.addEventListener("click", function(event) {
        event.preventDefault();
        self.port.emit("dequeue-clicked");
        document.body.removeChild(item);
    });
    item.appendChild(deq);
    document.body.appendChild(item);
});

self.port.on("activate-bookmarking", function() {
    // console.log("Bookmarking activated");
    var bookmark = document.getElementById("bookmark");
    bookmark.addEventListener("click", function(event) {
        event.preventDefault();
        self.port.emit("bookmark-clicked");
    });
});