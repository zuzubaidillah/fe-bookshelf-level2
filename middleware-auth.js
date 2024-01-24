// jQuery document ready function
$(document).ready(function() {
  // Check if LS_APP exists in localStorage
  if (!localStorage.getItem('LS_APP')) {
    // Redirect to login.html
    localStorage.clear()
    window.location.href = 'login.html';
  }
});