/**
 * panel.js
 */

self.port.on("activate-bookmarking", function() {
    // console.log("Bookmarking activated");
    var bookmark = document.getElementById("bookmark");
    bookmark.addEventListener("click", function(event) {
        event.preventDefault();
        self.port.emit("bookmark-clicked");
    });
});

self.port.on("activate-opening", function() {
    var open = document.getElementById("open");
    open.addEventListener("click", function(event) {
        event.preventDefault();
        self.port.emit("open-clicked");
    });
});

self.port.on("show", function(tab) {
    var title = tab[0];
    var url = tab[1];

    var item = document.createElement("div");
    var cls = document.createAttribute("class");
    cls.value = "item";
    item.setAttributeNode(cls);
    
    var link = document.createElement("div");
    var cls = document.createAttribute("class");
    cls.value = "link";
    link.setAttributeNode(cls);
    var text = document.createTextNode(title);
    link.appendChild(text);
    link.addEventListener("click", function(event) {
        self.port.emit("item-clicked", url);
        self.port.emit("hide");
    });
    item.appendChild(link);
    
    var deq = document.createElement("div");
    var cls = document.createAttribute("class");
    cls.value = "deq";
    deq.setAttributeNode(cls);
    var text = document.createTextNode("X");
    deq.appendChild(text);
    deq.addEventListener("click", function(event) {
        self.port.emit("dequeue-clicked", url);
        document.body.removeChild(item);
    });
    item.appendChild(deq);

    document.body.appendChild(item);
});
