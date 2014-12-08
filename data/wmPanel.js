/**
 * wmPanel.js
 */

var WARNING = false;

self.port.on("handle-warnings", handleWarnings);

self.port.on("activate", function() {
    var save = document.getElementById("save");
    save.addEventListener("click", function(event) {
        self.port.emit("save-clicked");
        self.port.on("enough-space", function(enoughSpace) {
            if (enoughSpace) {
                handleWarnings();

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

self.port.on("add", function(win) {
    var title = win[0];
    var tabs = win[1];

    var item = document.getElementById("list").firstChild;
    item.firstChild.childNodes[2].textContent = title;

    var tabsHTML = "";
    for (var i=0; i<tabs.length; i++) {
        var tab = tabs[i];
        tabsHTML += 
            '<li class="link">' +
                '<div class="label">' + tab[0] + '</div>' +
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
        self.port.emit("open-clicked", tabs);
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
            '<li class="link">' +
                '<div class="label">' + tab[0] + '</div>' +
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
        self.port.emit("open-clicked", tabs);
        event.stopPropagation();
    });
});

function handleWarnings() {
    if (WARNING) {
        document.body.removeChild(document.getElementById("warning"));
        WARNING = false;
    }
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