// Get modal element
var modal = document.getElementById('myModal');
// Get open modal button
var modalBtn = document.getElementById('raisealertBtn');

//on location button click 
document.getElementById("locationBtn").onclick = function () {
  window.location.assign("/html/fmap.html")
};

//on alert team button click
document.getElementById("alertteamBtn").onclick = function () {
  window.location.assign("/html/team1.html")
};

// Listen for open click
modalBtn.addEventListener('click', openModal);
// Listen for close click
closeBtn.addEventListener('click', closeModal);
// Listen for outside click
window.addEventListener('click', outsideClick);

// Function to open modal
function openModal() {
  modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
  modal.style.display = 'none';
}

// Function to close modal if outside click
function outsideClick(e) {
  if (e.target == modal) {
    modal.style.display = 'none';
  }
}


