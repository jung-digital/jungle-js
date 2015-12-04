var menuContainer = document.querySelector(".menu-component");
var configFilePath = "/menu-config.json";

window.jungleMenu = new Jungle.Menu(menuContainer, configFilePath);

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

window.jungleMenu.addListener(Jungle.Menu.LOAD_COMPLETE, function () {
  var sessionId = getParameterByName('sess');

  console.log('Menu Loaded!');

  if (sessionId !== '') {
    console.log(sessionId);

    var menuItems = window.jungleMenu.configData.items;
    menuItems.forEach(function (item) {
      if (item.loginRequired) {
        item.enabled = true;
      }
    });
  }
});

console.log(window.location.href);