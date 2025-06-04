// audio.js

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Audio script loaded!");
  
  // 1. Grab references to the <audio> element, the toggle button, and its <img> icon
  const audio = document.getElementById("bg-audio");
  const toggleBtn = document.getElementById("volume-toggle");
  const volumeIcon = document.getElementById("volume-icon");

  // Debug: Check if elements exist
  console.log("Audio element:", audio);
  console.log("Toggle button:", toggleBtn);
  console.log("Volume icon:", volumeIcon);

  if (!audio || !toggleBtn || !volumeIcon) {
    console.error("One or more required elements not found!");
    return;
  }

  // 2. Preload both "on" and "off" icons so toggling is instant
  const imgOn = new Image();
  const imgOff = new Image();

  // Fixed paths - added "../" to match your directory structure
  imgOn.src = "../images/soundon.png";
  imgOff.src = "../images/soundoff.png";

  // Debug: Check image loading
  imgOn.onload = () => console.log("Sound ON image loaded successfully");
  imgOn.onerror = () => console.error("Failed to load sound ON image");
  
  imgOff.onload = () => console.log("Sound OFF image loaded successfully");
  imgOff.onerror = () => console.error("Failed to load sound OFF image");

  // 3. Initialize state: start paused, show "off" icon
  audio.pause();
  audio.volume = 0.5; // Set volume to 50% to make sure it's audible
  volumeIcon.src = imgOff.src;

  // 4. When the button is clicked, toggle play/pause and swap the icon
  toggleBtn.addEventListener("click", () => {
    console.log("Button clicked! Audio paused:", audio.paused);
    
    if (audio.paused) {
      // Try to play; if blocked by browser (autoplay policies), catch error
      audio
        .play()
        .then(() => {
          console.log("Audio playing!");
          volumeIcon.src = imgOn.src;
        })
        .catch((err) => {
          console.error("Audio playback was blocked:", err);
          alert("Audio playback failed. Check the console for details.");
        });
    } else {
      console.log("Pausing audio");
      audio.pause();
      volumeIcon.src = imgOff.src;
    }
  });

  // Debug: Check if audio file can be loaded
  audio.addEventListener('loadeddata', () => {
    console.log("Audio file loaded successfully!");
  });

  audio.addEventListener('error', (e) => {
    console.error("Audio loading error:", e);
    console.error("Audio error code:", audio.error?.code);
    console.error("Audio error message:", audio.error?.message);
  });
});