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
        item.children[0].children[0].addEventListener("click", function(event) {
            if (item.classList.contains("expanded")) {
                hideChildren(item);
            }
            else {
                showChildren(item);
            }
            item.classList.toggle("expanded");
        });
        item.classList.add("collapsed");
        hideChildren(item);
    }
    function prepareList() {
        var list = document.getElementById("list");
        var children = list.children;
        for (var i=0; i<children.length; i++) {
            createList(children[i]);
        }
    }
    prepareList();
});

self.port.on("show", function(win) {
    var title = win[0];
    var tabs = win[1];

    
});