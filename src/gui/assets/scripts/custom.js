// Because, who doesn't love jQuery?
jQuery(document).ready(function($) {
  $('.show-login-modal').on('click', function(e) {
    $('#login-modal').modal('show');
    $('#signup-modal').modal('hide');
    e.preventDefault();
  });
  $('.show-signup-modal').on('click', function(e) {
    $('#signup-modal').modal('show');
    $('#login-modal').modal('hide');
    e.preventDefault();
  });
});

// function display_poem() {
//   $('#info-msg p').html('The pleasure of Shawn’s company\
//  Is what I most enjoy.\
//  He put a tack on Ms. Yancey’s chair\
//  When she called him a horrible boy.\
//  At the end of the month he was flinging two kittens\
//  Across the width of the room.\
//  I count on his schemes to show me a way now\
//  Of getting away from my gloom.\
//   <p class="blink">PRESS ENTER WHEN YOU\'RE DONE</p>');
//
//   $('#info-msg').css('animation', 'none');
// }
//
// function hide_poem() {
//   $('#info-msg')
//     .html('<p>Hold down the space bar to send a command.</p>');
//   $('#info-msg').css('animation', 'fadeIn 1s infinite alternate');
// }
