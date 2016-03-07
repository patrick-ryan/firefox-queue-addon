/**
 * panel.js
 */

var WARNING = false;
var ENV = "tab"; // "win";
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
        if (ENV == "win") {
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

    var menu = document.getElementById("menu");
    menu.addEventListener("click", function(event) {
        if (menu.classList.contains("menu-selected")) {
            menu.classList.remove("menu-selected");
            menu.classList.add("menu-not-selected");
            document.getElementById(ENV + "menu").style.display = "none";
        }
        else {
            menu.classList.remove("menu-not-selected");
            menu.classList.add("menu-selected");
            document.getElementById(ENV + "menu").style.display = "block";
        }
    });

    // var doc = document;
    // doc.addEventListener("click", function(event) {
    //     console.log(event.currentTarget);
    // });

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

// if (SAVED) {} else {}
self.port.on("save-win", function(tabs) {
    if (tabs) {
        handleWarnings();
        if (ENV == "tab") {
            tabs = getSelectedTabs();
            switchEnv();
        }

        var list = document.getElementById("winlist");
        var item = addWindow(["",tabs]);
        item.firstChild.childNodes[2].appendChild(addForm(tabs));
        list.insertBefore(item, list.firstChild.nextSibling.nextSibling);
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
    document.getElementById("tablist").appendChild(addTab(tab));
});

self.port.on("show-win", function(win) {
    document.getElementById("winlist").appendChild(addWindow(win));
});

function switchEnv() {
    var oldEnv = ENV;
    if (oldEnv == "tab") {
        self.port.emit("switch-env", "win");
        ENV = "win";
    }
    else {
        self.port.emit("switch-env", "tab");
        ENV = "tab";
    }
    document.getElementById(oldEnv).className = "env-not-selected";
    document.getElementById(oldEnv + "menu").style.display = "none";
    document.getElementById(oldEnv + "list").style.display = "none";
    document.getElementById(ENV).className = "env-selected";
    document.getElementById(ENV + "menu").style.display = "";
    document.getElementById(ENV + "list").style.display = "";
}

function handleWarnings() {
    var menu = document.getElementById("menu");
    if (menu.classList.contains("menu-selected")) {
        menu.classList.remove("menu-selected");
        menu.classList.add("menu-not-selected");
        document.getElementById(ENV + "menu").style.display = "none";
    }

    if (WARNING) {
        document.body.removeChild(document.getElementById("warning"));
        WARNING = false;
    }
}

function addForm(tabs) {
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

    handleSubmit = function(event) {
        var title = document.getElementById("title").value;
        form.parentNode.textContent = title;
        form.parentNode.removeChild(form);
        self.port.emit("title-entered", [title, tabs]);
    }
    form.addEventListener("submit", handleSubmit);

    return form;
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

function addTab(tab) {
    var template = document.getElementById("tab-item");
    var item = template.cloneNode(true);
    item.removeAttribute("id");
    item.removeAttribute("style");
    item.href = tab[1];
    item.firstChild.firstChild.textContent = tab[0];
    item.firstChild.lastChild.textContent = "(" + tab[1] + ")";

    item.lastChild.addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("remove-tab-clicked", tab[1]);
        item.parentNode.removeChild(item);
    });

    if (item) {
        selectLink(item);
    }
    return item;
}

function addWindow(win) {
    var title = win[0];
    var tabs = win[1];

    var template = document.getElementById("win-item");
    var item = template.cloneNode(true);
    item.removeAttribute("id");
    item.removeAttribute("style");
    item.firstChild.childNodes[2].textContent = title;

    for (var i=0; i<tabs.length; i++) {
        item.appendChild(addTab(tabs[i]));
    }

    item.firstChild.childNodes[3].addEventListener("click", function(event) {
        handleWarnings();

        // title populated in item
        if (title == "") {
            title = item.firstChild.childNodes[2].textContent;
        }
        self.port.emit("remove-win-clicked", title);

        item.parentNode.removeChild(item);
        event.stopPropagation();
    });

    item.firstChild.childNodes[4].addEventListener("click", function(event) {
        handleWarnings();
        self.port.emit("open-clicked", [true, tabs]);
        event.stopPropagation();
    });

    prepareList(item);
    return item;
}

function selectLink(link) {
    link.addEventListener("click", function(event) {
        if (link.classList.contains("selected")) {
            if (ENV == "win") {
                link.parentNode.firstChild.classList.remove("selected");
            }
            link.classList.remove("selected");
        }
        else {
            link.classList.add("selected");
        }
    });
}

function selectWindow(item) {
    var win = item.firstChild;
    win.addEventListener("click", function(event) {
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
    });
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
        selectWindow(item);
    }
}

function getSelectedTabs() {
    var tabs = [];
    var selectTabs = function(items) {
        // exclude first item, which is template for tablist and win for win-item
        for (var i=1; i<items.length; i++) {
            var item = items[i];
            if (item.classList.contains("selected")) {
                tabs.push([item.firstChild.firstChild.textContent, item.href]);
            }
        }
    }
    if (ENV == "tab") {
        // excludes text and comment nodes
        selectTabs(document.getElementById("tablist").children);
    }
    else {
        var items = document.getElementById("winlist").children;
        // exclude first item, which is template
        for (var i=1; i<items.length; i++) {
            selectTabs(items[i].children);
        }
    }
    return tabs;
}