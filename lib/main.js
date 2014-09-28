/**
 * main.js
 */

// var buttons = require('sdk/ui/button/action');
var buttons = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');
var self = require('sdk/self');
var tabs = require('sdk/tabs');

var button = buttons.ToggleButton({
    id: "queue",
    label: "Queue",
    icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
    },
    onChange: handleChange
});

var panel = panels.Panel({
    contentURL: self.data.url("panel.html"),
    contentScriptFile: self.data.url("display-tabs.js"),
    onShow: handleShow,
    onHide: handleHide
});

function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button
        });
    }
}

function handleShow(state) {
    for each (var tab in tabs) {
        panel.port.emit("show", [tab.title, tab.url]);
    }
    panel.port.emit("end");
}

panel.port.on("new-tab", function(url) {
    tabs.open(url);
});

panel.port.on("hide", function() {
    panel.hide();
});

function handleHide(state) {
    console.log("Done.");
    button.state('window', {checked: false});
}
