/**
 * panel.js
 */

var WARNING = false;


self.port.on("handle-warnings", handleWarnings);

self.port.on("save-cancelled", function() {
    removeForm();
});

self.port.on("activate", function() {
    var bookmark = document.getElementById("bookmark");
    bookmark.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("bookmark-clicked", getSelectedTabs());
    });

    var open = document.getElementById("open");
    open.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("open-clicked", getSelectedTabs());
    });

    var save = document.getElementById("save");
    save.addEventListener("click", function(event) {
        if (!removeForm()) {
            self.port.emit("save-clicked");
        }
    });
});

self.port.on("show", function(tab) {
    var title = tab[0];
    var url = tab[1];

    var list = document.getElementById("list");

    var item = document.createElement("div");
    item.className = "item flexbox-row";
    item.href = url;
    item.innerHTML = 
        '<div class="link">' + title + '</div>' +
        '<div class="circle remove">&times;</div>';

    item.lastChild.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("dequeue-clicked", url);
        list.removeChild(item);
    });

    prepareList(item);
    list.appendChild(item);
});

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
        if (form) {
            form.addEventListener("submit", handleSubmit);
        }
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

function handleSubmit(event) {
    var form = document.getElementById("form");
    if (form) {
        var title = document.getElementById("title").value;
        form.parentNode.removeChild(form);
        self.port.emit("title-entered", [title, getSelectedTabs()]);
    }
}

function handleWarnings() {
    if (WARNING) {
        document.body.removeChild(document.getElementById("warning"));
        WARNING = false;
    }
}

function removeForm() {
    var form = document.getElementById("form");
    if (form) {
        form.removeEventListener("submit", handleSubmit);
        form.parentNode.removeChild(form);
        return true;
    }
    return false;
}

function selectLink(link) {
    link.addEventListener("click", function(event) {
        if (link.classList.contains("selected")) {
            link.classList.remove("selected");
        }
        else {
            link.classList.add("selected");
        }
    });
}

function prepareList(item) {
    if (item) {
        selectLink(item);
    }
}

function getSelectedTabs() {
    var items = document.getElementById("list").children;
    var tabs = [];
    for (var i=0; i<items.length; i++) {
        var item = items[i];
        if (item.classList.contains("selected")) {
            tabs.push([item.firstChild.textContent, item.href]);
        }
    }
    return tabs;
}