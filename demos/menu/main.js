
$.get("/menu-config.json", function(data) {

	var jungleMenu = new Jungle.Menu({
			container: document.querySelector(".menu-component"),
			config: data,
			isSticky: true
		})

	jungleMenu.render();
  
});
