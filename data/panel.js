/**
 * panel.js
 */

var WARNING = false;
var ENV = "tab"; // "window";


self.port.on("handle-warnings", handleWarnings);

self.port.on("save-cancelled", function() {
    removeForm();
});

self.port.on("activate", function() {
    // var autosave = document.getElementById("autosave");
    // autosave.addEventListener("click", function(event) {
    //     handleWarnings();
    //     if (autosave.classList.contains("selected")) {
    //         autosave.classList.remove("selected");
    //     }
    //     else {
    //         autosave.classList.add("selected");
    //     }
    // });

    var bookmark = document.getElementById("bookmark");
    bookmark.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("bookmark-clicked", getSelectedTabs());
    });

    var open = document.getElementById("open");
    open.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("open-clicked", [false, getSelectedTabs()]);
    });

    var openWindow = document.getElementById("openWindow");
    openWindow.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("open-clicked", [true, getSelectedTabs()]);
    });

    var save = document.getElementById("save");
    save.addEventListener("click", function(event) {
        if (!removeForm()) {
            self.port.emit("save-clicked");
        }
    });

    // var saveCurrent = document.getElementById("saveCurrent");
    // saveCurrent.addEventListener("click", function(event) {
    //     handleWarnings();
    // });

    // var export = document.getElementById("export");
    // export.addEventListener("click", function(event) {
    //     handleWarnings();
    //     self.port.emit("export-clicked");
    // });
});

self.port.on("enough-space", function(enoughSpace) {
    if (enoughSpace) {
        handleWarnings();

        var div = document.createElement("div");
        var form = document.createElement("form");
        form.id = "form";
        var label = document.createElement("label");
        label.textContent = "Enter window title: ";
        form.appendChild(label);
        var text = document.createElement("input");
        text.type = "text";
        text.id = "title";
        text.style = "width: 40%;";
        form.appendChild(text);
        var submit = document.createElement("input");
        submit.type = "submit";
        submit.value = "Done";
        form.appendChild(submit);
        div.appendChild(form);

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

self.port.on("show", function(tab) {
    var title = tab[0];
    var url = tab[1];

    var list = document.getElementById("list");

    var item = document.createElement("div");
    item.className = "item flexbox-row";
    item.href = url;
    var link = document.createElement("div");
    link.className = "link";
    link.textContent = title;
    item.appendChild(link);
    var remove = document.createElement("div");
    remove.className = "circle remove";
    remove.textContent = "x";
    item.appendChild(remove);

    item.lastChild.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("remove-clicked", url);
        list.removeChild(item);
    });

    prepareList(item);
    list.appendChild(item);
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
    // excludes text and comment nodes
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