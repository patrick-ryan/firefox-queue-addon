/**
 * wmPanel.js
 */

var WARNING = false;
// var SAVED = false;


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

        // if (SAVED) {} else {}

        var list = document.getElementById("list");

        var item = document.createElement("ul");
        item.className = "item";

        item.innerHTML = 
            '<div class="win flexbox-row">' +
                '<div class="circle toggleList">&plus;</div>' +
                '<div class="circle toggleList">&minus;</div>' +
                '<div class="label">' + 
                    '<form id="form">' +
                        '<input type="text" id="title" style="width: 50%;">' + 
                        '<input type="submit" value="Done">' +
                    '</form>' +
                '</div>' +
                '<li class="circle remove">&times;</li>' +
                '<li class="open">Open</li>' +
                '<div class="circle toggleMenu">&lt;</div>' +
                '<div class="circle toggleMenu">&gt;</div>' +
            '</div>';

        prepareList(item);
        list.insertBefore(item, list.firstChild);

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

self.port.on("add", function(win) {
    var title = win[0];
    var tabs = win[1];

    var item = document.getElementById("list").firstChild;
    item.firstChild.childNodes[2].textContent = title;

    var tabsHTML = "";
    for (var i=0; i<tabs.length; i++) {
        var tab = tabs[i];
        tabsHTML += 
            '<li class="link" href="' + tab[1] + '">' +
                '<div class="label">' + tab[0] + ' (' + tab[1] + ')' + '</div>' +
            '</li>';
    }

    item.innerHTML += tabsHTML;
    prepareList(item);

    item.firstChild.childNodes[3].addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("remove-clicked", title);
        item.parentNode.removeChild(item);
        event.stopPropagation();
    });

    item.firstChild.childNodes[4].addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("open-clicked", [true, tabs]);
        event.stopPropagation();
    });
});

self.port.on("show", function(win) {
    var title = win[0];
    var tabs = win[1];

    var list = document.getElementById("list");

    var item = document.createElement("ul");
    item.className = "item";

    var tabsHTML = "";
    for (var i=0; i<tabs.length; i++) {
        var tab = tabs[i];
        tabsHTML += 
            '<li class="link" href="' + tab[1] + '">' +
                '<div class="label">' + tab[0] + ' (' + tab[1] + ')' + '</div>' +
            '</li>';
    }

    item.innerHTML = 
        '<div class="win flexbox-row">' +
            '<div class="circle toggleList">&plus;</div>' +
            '<div class="circle toggleList">&minus;</div>' +
            '<div class="label">' + title + '</div>' +
            '<li class="circle remove">&times;</li>' +
            '<li class="open">Open</li>' +
            '<div class="circle toggleMenu">&lt;</div>' +
            '<div class="circle toggleMenu">&gt;</div>' +
        '</div>' + tabsHTML;

    prepareList(item);
    list.appendChild(item);

    item.firstChild.childNodes[3].addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("remove-clicked", title);
        list.removeChild(item);
        event.stopPropagation();
    });

    item.firstChild.childNodes[4].addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("open-clicked", [true, tabs]);
        event.stopPropagation();
    });
});

function handleSubmit(event) {
    var form = document.getElementById("form");
    if (form) {
        var title = document.getElementById("title").value;
        form.parentNode.removeChild(form);
        self.port.emit("title-entered", title);
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
        var item = form.parentNode.parentNode.parentNode;
        item.parentNode.removeChild(item);
        return true;
    }
    return false;
}

function selectWindow(win) {
    var children = win.parentNode.childNodes;
    if (win.classList.contains("selected")) {
        win.classList.remove("selected");

        for (var i=1; i<children.length; i++) {
            children[i].classList.remove("selected");
        }
    }
    else {
        win.classList.add("selected");

        for (var i=1; i<children.length; i++) {
            children[i].classList.add("selected");
        }
    }
}

function selectLink(link) {
    link.addEventListener("click", function(event) {
        if (link.classList.contains("selected")) {
            link.parentNode.firstChild.classList.remove("selected");
            link.classList.remove("selected");
        }
        else {
            link.classList.add("selected");
        }
    });
}

function createSelectListeners(item) {
    var win = item.firstChild;
    win.addEventListener("click", function(event) {
        selectWindow(win);
    });

    var children = item.childNodes;
    for (var i=1; i<children.length; i++) {
        selectLink(children[i]);
    }
}

function hideChildren(parent) {
    var children = parent.childNodes;
    for (var i=0; i<children.length; i++) {
        var child = children[i];
        if (child.tagName == "LI") {
            child.style.display = "none";
        }
    }
}

function showChildren(parent) {
    var children = parent.childNodes;
    for (var i=0; i<children.length; i++) {
        var child = children[i];
        if (child.tagName == "LI") {
            child.style.display = "";
        }
    }
}

function createList(item) {
    var win = item.firstChild;
    var plus = win.firstChild;
    var minus = plus.nextSibling;
    plus.addEventListener("click", function(event) {
        showChildren(item);
        plus.style.display = "none";
        minus.style.display = "";
        event.stopPropagation();
    });
    minus.addEventListener("click", function(event) {
        hideChildren(item);
        minus.style.display = "none";
        plus.style.display = "";
        event.stopPropagation();
    });
    hideChildren(item);
    minus.style.display = "none";
}

function createMenuList(item) {
    var win = item.firstChild;
    var greaterThan = win.lastChild;
    var lessThan = greaterThan.previousSibling;
    lessThan.addEventListener("click", function(event) {
        showChildren(win);
        lessThan.style.display = "none";
        greaterThan.style.display = "";
        event.stopPropagation();
    });
    greaterThan.addEventListener("click", function(event) {
        hideChildren(win);
        greaterThan.style.display = "none";
        lessThan.style.display = "";
        event.stopPropagation();
    });
    hideChildren(win);
    greaterThan.style.display = "none";
}

function prepareList(item) {
    if (item) {
        createList(item);
        createMenuList(item);
        createSelectListeners(item);
    }
}

function getSelectedTabs() {
    var items = document.getElementById("list").children;
    var tabs = [];
    for (var i=0; i<items.length; i++) {
        var children = items[i].children;
        for (var j=1; j<children.length; j++) {
            var link = children[j];
            if (link.classList.contains("selected")) {
                tabs.push([link.firstChild.textContent, link.getAttribute("href")]);
            }
        }
    }
    return tabs;
}