var menuContainer = document.querySelector(".menu-component");
var configFilePath = "/menu-config.json";

window.jungleMenu = new Jungle.Menu(menuContainer, configFilePath);

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var sessionId = getParameterByName('sess');

if (sessionId !== '') {
  window.jungleMenu.addListener(Jungle.Menu.LOAD_COMPLETE, function () {
    console.log(sessionId);

    var menuItems = window.jungleMenu.configData.items;
    menuItems.forEach(function (item) {
      if (item.loginRequired) {
        item.enabled = true;
        item.href += '?' + window.jungleMenu.configData.sessionVariable + '=' + sessionId;
        console.log(item.href);
      }
    });
  });
}

window.jungleMenu.addListener(Jungle.Menu.RENDERED, function () {
  $('#formLogin').attr('action', window.jungleMenu.configData.action);
  $('#formInputCallback').attr('value', window.jungleMenu.configData.callback);
});

console.log(window.location.href);
