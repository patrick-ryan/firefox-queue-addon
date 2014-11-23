/**
 * wmPanel.js
 */

self.port.on("activate", function() {
    prepareList();

    var save = document.getElementById("save");
    save.addEventListener("click", function(event) {
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
            self.port.emit("save-clicked", title);
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
        self.port.emit("remove-clicked", title);
        item.parentNode.removeChild(item);
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
        self.port.emit("remove-clicked", title);
        list.removeChild(item);
    });
});

function hideChildren(parent) {
    var children = parent.children;
    for (var i=0; i<children.length; i++) {
        var child = children[i];
        if (child.tagName == "LI") {
            child.style.display = "none";
        }
    }
}

function showChildren(parent) {
    var children = parent.children;
    for (var i=0; i<children.length; i++) {
        var child = children[i];
        if (child.tagName == "LI") {
            child.style.display = "";
        }
    }
}

function createList(item) {
    var win = item.children[0];
    var plus = win.children[0];
    var minus = win.children[1];
    plus.addEventListener("click", function(event) {
        showChildren(item);
        plus.style.display = "none";
        minus.style.display = "";
    });
    minus.addEventListener("click", function(event) {
        hideChildren(item);
        minus.style.display = "none";
        plus.style.display = "";
    });
    hideChildren(item);
    minus.style.display = "none";
}

function createMenuList(item) {
    var win = item.children[0];
    var lessThan = win.children[5];
    var greaterThan = win.children[6];
    lessThan.addEventListener("click", function(event) {
        showChildren(win);
        lessThan.style.display = "none";
        greaterThan.style.display = "";
    });
    greaterThan.addEventListener("click", function(event) {
        hideChildren(win);
        greaterThan.style.display = "none";
        lessThan.style.display = "";
    });
    hideChildren(win);
    greaterThan.style.display = "none";
}

function prepareList(item) {
    if (item) {
        createList(item);
        createMenuList(item);
    }
}