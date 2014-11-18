/**
 * panel.js
 */

self.port.on("activate", function() {
    // console.log("Bookmarking activated");
    var bookmark = document.getElementById("bookmark");
    bookmark.addEventListener("click", function(event) {
        self.port.emit("bookmark-clicked");
    });

    var open = document.getElementById("open");
    open.addEventListener("click", function(event) {
        self.port.emit("open-clicked");
    });
});

self.port.on("show", function(tab) {
    var title = tab[0];
    var url = tab[1];

    var list = document.getElementById("list");

    var item = document.createElement("div");
    item.className = "item";
    item.innerHTML = 
        '<div class="link">' + title + '</div>' +
        '<div class="deq">&times;</div>';

    item.firstChild.addEventListener("click", function(event) {
        self.port.emit("item-clicked", url);
    });

    item.lastChild.addEventListener("click", function(event) {
        self.port.emit("dequeue-clicked", url);
        list.removeChild(item);
    });

    list.appendChild(item);
});
