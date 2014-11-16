/**
 * wmPanel.js
 */

self.port.on("activate", function() {
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
    function prepareList() {
        var list = document.getElementById("list");
        var children = list.children;
        for (var i=0; i<children.length; i++) {
            var item = children[i];
            createList(item);
            createMenuList(item);
        }
    }
    prepareList();
});

self.port.on("show", function(win) {
    var title = win[0];
    var tabs = win[1];

    var list = document.getElementById("list");

    var item = document.createElement("ul");
    item.className = "item";
    item.innerHTML = 
        '<div class="win flexbox-row">
            <div class="circle toggleList">&plus;</div>
            <div class="circle toggleList">&minus;</div>
            <div class="label">' + title + '</div>
            <li class="circle remove">&times;</li>
            <li class="open">Open</li>
            <div class="circle toggleMenu">&lt;</div>
            <div class="circle toggleMenu">&gt;</div>
        </div>';

    console.log(tabs);
});