/**
 * panel.js
 */

var WARNING = false;

self.port.on("handle-warnings", handleWarnings);

self.port.on("activate", function() {
    // console.log("Bookmarking activated");
    var bookmark = document.getElementById("bookmark");
    bookmark.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("bookmark-clicked");
    });

    var open = document.getElementById("open");
    open.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("open-clicked");
    });

    var save = document.getElementById("save");
    save.addEventListener("click", function(event) {
        self.port.emit("save-clicked");
        self.port.on("enough-space", function(enoughSpace) {
            if (enoughSpace) {
                handleWarnings();

                var div = document.createElement("div");
                div.innerHTML = 
                    '<form id="form">' +
                        '<label>Enter window title: </label>' +
                        '<input type="text" id="title" style="width: 40%;">' + 
                        '<input type="submit" value="Done">' +
                    '</form>';

                document.body.insertBefore(div, document.getElementById("heading").nextSibling);

                var form = document.getElementById("form");
                form.addEventListener("submit", function(event) {
                    var title = document.getElementById("title").value;
                    form.parentNode.removeChild(form);
                    self.port.emit("title-entered", title);
                });
            }
            else {
                if (!WARNING) {
                    var warning = document.createElement("div");
                    warning.id = "warning";
                    warning.className = "warning";
                    warning.textContent = "Not enough space to save window!";
                    document.body.insertBefore(warning, document.getElementById("heading").nextSibling);
                    WARNING = true;
                }
            }
        });
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
        handleWarnings();
        self.port.emit("item-clicked", url);
    });

    item.lastChild.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("dequeue-clicked", url);
        list.removeChild(item);
    });

    list.appendChild(item);
});

function handleWarnings() {
    if (WARNING) {
        document.body.removeChild(document.getElementById("warning"));
        WARNING = false;
    }
}