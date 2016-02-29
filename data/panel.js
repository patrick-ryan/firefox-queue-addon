/**
 * panel.js
 */

var WARNING = false;
var ENV = "tab"; // "window";
var handleSubmit; // ugh.
// var SAVED = false;


self.port.on("handle-warnings", handleWarnings);

self.port.on("save-cancelled", function() {
    removeForm();
});

self.port.on("activate", function() {
    var tab = document.getElementById("tab");
    tab.addEventListener("click", function(event) {
        handleWarnings();
        if (ENV == "window") {
            switchEnv();
        }
    });

    var win = document.getElementById("win");
    win.addEventListener("click", function(event) {
        handleWarnings();
        if (ENV == "tab") {
            switchEnv();
        }
    });

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

    var openTab = document.getElementById("opentab");
    openTab.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("open-clicked", [false, getSelectedTabs()]);
    });

    var saveTab = document.getElementById("savetab");
    saveTab.addEventListener("click", function(event) {
        if (!removeForm()) {
            self.port.emit("save-clicked");
        }
    });

    var openWin = document.getElementById("openwin");
    openWin.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("open-clicked", [false, getSelectedTabs()]);
    });

    var openNewWin = document.getElementById("opennewwin");
    openNewWin.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("open-clicked", [true, getSelectedTabs()]);
    });

    var saveWin = document.getElementById("savewin");
    saveWin.addEventListener("click", function(event) {
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

self.port.on("save-win", function(tabs) {
    if (tabs) {
        var title;

        if (ENV == "tab") {
            tabs = getSelectedTabs();
            switchEnv();
        }
        handleWarnings();

        // if (SAVED) {} else {}

        var list = document.getElementById("winlist");

        var item = addWindow(tabs);

        var form = document.createElement("form");
        form.id = "form";
        var text = document.createElement("input");
        text.type = "text";
        text.id = "title";
        text.style = "width: 50%;";
        form.appendChild(text);
        var submit = document.createElement("input");
        submit.type = "submit";
        submit.value = "Done";
        form.appendChild(submit);

        item.firstChild.childNodes[2].appendChild(form);

        list.insertBefore(item, list.firstChild.nextSibling);

        var form = document.getElementById("form");
        if (form) {
            handleSubmit = function(event) {
                var form = document.getElementById("form");
                if (form) {
                    title = document.getElementById("title").value;
                    form.parentNode.removeChild(form);
                    item.firstChild.childNodes[2].textContent = title;
                    self.port.emit("title-entered", [title, tabs]);
                }
            }
            form.addEventListener("submit", handleSubmit);
        }

        item.firstChild.childNodes[3].addEventListener("click", function(event) {
            handleWarnings();
            self.port.emit("remove-win-clicked", title);
            item.parentNode.removeChild(item);
            event.stopPropagation();
        });

        item.firstChild.childNodes[4].addEventListener("click", function(event) {
            handleWarnings();
            self.port.emit("open-clicked", [true, tabs]);
            event.stopPropagation();
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

self.port.on("show-tab", function(tab) {
    var title = tab[0];
    var url = tab[1];

    var list = document.getElementById("tablist");

    var template = document.getElementById("tab-item");
    var item = template.cloneNode(true);
    item.removeAttribute("id");
    item.removeAttribute("style");
    item.href = url;
    item.firstChild.firstChild.textContent = title;
    item.firstChild.lastChild.textContent = "(" + url + ")";

    item.lastChild.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("remove-tab-clicked", url);
        list.removeChild(item);
    });

    if (item) {
        selectLink(item);
    }
    list.appendChild(item);
});

self.port.on("show-win", function(win) {
    var title = win[0];
    var tabs = win[1];

    var list = document.getElementById("winlist");

    var item = addWindow(tabs);
    item.firstChild.childNodes[2].textContent = title;

    list.appendChild(item);

    item.firstChild.childNodes[3].addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("remove-win-clicked", title);
        list.removeChild(item);
        event.stopPropagation();
    });

    item.firstChild.childNodes[4].addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("open-clicked", [true, tabs]);
        event.stopPropagation();
    });
});

function switchEnv() {
    if (ENV == "tab") {
        self.port.emit("switch-env", "window");
        ENV = "window";
        document.getElementById("tab").className = "env-not-selected";
        document.getElementById("tabmenu").style.display = "none";
        document.getElementById("tablist").style.display = "none";
        document.getElementById("win").className = "env-selected";
        document.getElementById("winmenu").style.display = "";
        document.getElementById("winlist").style.display = "";
    }
    else {
        self.port.emit("switch-env", "tab");
        ENV = "tab";
        document.getElementById("win").className = "env-not-selected";
        document.getElementById("winmenu").style.display = "none";
        document.getElementById("winlist").style.display = "none";
        document.getElementById("tab").className = "env-selected";
        document.getElementById("tabmenu").style.display = "";
        document.getElementById("tablist").style.display = "";
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

// var item = document.createElement("div");
// item.className = "item flexbox-row";
// item.href = url;
// var link = document.createElement("div");
// link.className = "win-link";
// link.textContent = title;
// item.appendChild(link);
// var remove = document.createElement("div");
// remove.className = "circle remove";
// remove.textContent = "x";
// item.appendChild(remove);
function addWindow(tabs) {
    var template = document.getElementById("win-item");
    var item = template.cloneNode(true);
    item.removeAttribute("id");
    item.removeAttribute("style");

    for (var i=0; i<tabs.length; i++) {
        var tab = tabs[i];
        var child = document.createElement("li");
        child.className = "win-link";
        child.href = tab[1];
        var opt = document.createElement("div");
        opt.className = "label";
        opt.textContent = tab[0];
        child.appendChild(opt);
        var url = document.createElement("div");
        url.className = "url";
        url.textContent = "(" + tab[1] + ")";
        child.appendChild(url);
        item.appendChild(child);
    }
    prepareList(item);
    return item;
}

function selectLink(link) {
    link.addEventListener("click", function(event) {
        if (link.classList.contains("selected")) {
            if (ENV == "window") {
                link.parentNode.firstChild.classList.remove("selected");
            }
            link.classList.remove("selected");
        }
        else {
            link.classList.add("selected");
        }
    });
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
    var tabs = [];
    if (ENV == "tab") {
        // excludes text and comment nodes
        var items = document.getElementById("tablist").children;
        for (var i=0; i<items.length; i++) {
            var item = items[i];
            if (item.classList.contains("selected")) {
                tabs.push([item.firstChild.textContent, item.href]);
            }
        }
    }
    else {
        var items = document.getElementById("winlist").children;
        for (var i=1; i<items.length; i++) {
            var children = items[i].children;
            for (var j=1; j<children.length; j++) {
                var link = children[j];
                if (link.classList.contains("selected")) {
                    tabs.push([link.firstChild.textContent, link.href]);
                }
            }
        }
    }
    return tabs;
}