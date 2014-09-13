var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var ss = require('sdk/simple-storage');

var button = buttons.ActionButton({
  id: "list-tabs",
  label: "List Tabs",
  icon: "./icon-16.png",
  onClick: listTabs
});

function listTabs() {
  var tabs = require("sdk/tabs");
  for each (var tab in tabs)
    runScript(tab);
}
 
function runScript(tab) {
    console.log(tab.url);
    console.log(tab.title);
  tab.attach({
    contentScript: "document.body.style.border = '5px solid red';"
  });
}