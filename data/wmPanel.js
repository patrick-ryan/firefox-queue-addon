/**
 * wmPanel.js
 */

self.port.on("activate", function() {
    function hideChildren(parent) {
        var children = parent.children;
        for (var i=0; i<children.length; i++) {
            children[i].style.display = "none";
        }
    }
    function showChildren(parent) {
        var children = parent.children;
        for (var i=0; i<children.length; i++) {
            children[i].style.display = "";
        }
    }
    function prepareList() {
        list = document.getElementById("list");
        var children = list.children;
        for (var i=0; i<children.length; i++) {
            var item = children[i];
            item.addEventListener("click", function(event) {
                event.preventDefault();
                if (item.classList.contains("expanded")) {
                    hideChildren(item.children[0]);
                }
                else {
                    showChildren(item.children[0]);
                }
                item.classList.toggle("expanded");
            });
            item.classList.add("collapsed");
            console.log(item.classList);
            hideChildren(item.children[0]);
        }
    }
    prepareList();
});

self.port.on("show", function(win) {
    var title = win[0];
    var tabs = win[1];

    
});