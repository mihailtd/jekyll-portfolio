function animateIcons(icons, type) {
  var tl = new TimelineLite();
  if (type === 'out') {
    rot = '0'
  } else {
    rot = '180'
  }

  tl.to(icons, 0.5, {
    rotationY: rot
  });
}

$(document).ready(function () {
  var postLinks = $('.post-link').toArray();

  $.each(postLinks, function (i, val) {
    var tags = $(this).parent().siblings('.post-tags').children().children();
    $(this).hover(function () {
      // perform code on hover
      animateIcons(tags);
    }, function () {
      // perform code on mouseout
      animateIcons(tags, 'out');
    });
  })
})