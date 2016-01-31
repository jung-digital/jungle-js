window.slideSwipeVertical = new Jungle.SlideSwipe({
  baseSelector: '.vertical',
  startIndexX: 0,
  startIndexY: 0
});

slideSwipeVertical.setSlides(['.vertical .slide']);

window.slideSwipeHorizontal = new Jungle.SlideSwipe({
  baseSelector: '.horizontal',
  startIndexX: 0,
  startIndexY: 0
});

slideSwipeHorizontal.setSlides('.horizontal .slide');
