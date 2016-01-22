var menuContainer = document.querySelector(".menu-component");
var configFilePath = "/menu-config.json";

window.jungleMenu = new Jungle.Menu(menuContainer, configFilePath);

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getCookie(name) {
  console.log(document.cookie);
  var cookies = document.cookie.split(';').filter(function (item) {return item.indexOf(name) != -1;});
  return cookies.length == 1 ? cookies[0].split('=')[1] : '';
}

var sessionId = getParameterByName('sess');
sessionId = sessionId == '' ? getCookie('sessionId') : sessionId;

if (sessionId !== '') {
  document.cookie = 'sessionId=' + sessionId + ';';

  window.jungleMenu.addListener(Jungle.Menu.LOAD_COMPLETE, function () {
    window.jungleMenu.configData.items.forEach(processItem);
  });

  function processItem(item) {
    if (item.name === 'Login') {
      item.enabled = false;
    } else if (item.name === 'Logout') {
      item.enabled = true;
    }
    if (item.loginRequired) {
      item.enabled = true;
      if (item.href.indexOf('javascript') == -1) {
        item.href += sessionId;
      }
    }

    item.href = item.href.replace('SESSION_ID', sessionId);

    if (item.children) {
      item.children.forEach(processItem);
    }
  }
}

window.jungleMenu.addListener(Jungle.Menu.RENDERED, function () {
  $('#formLogin').attr('action', window.jungleMenu.configData.action);
  $('#formInputCallback').attr('value', window.jungleMenu.configData.callback);
});

window.openSubMenu = function (id) {
  $('.child-menu').css('max-height', '0px');

  if ($('.child-menu-' + id).css('max-height') == '0px') {
    $('.child-menu-' + id).css('max-height', '300px');
  } else {
    $('.child-menu-' + id).css('max-height', '0px');
  }
};

window.logout = function () {
  document.cookie = 'sessionId=;';
  window.location.href = window.jungleMenu.configData.logout;
  parent.main.src = window.jungleMenu.configData.home;
};
