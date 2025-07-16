document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Add some interactive hover effects
document.querySelectorAll(".feature-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-5px) scale(1.02)";
  });
  a;
  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0) scale(1)";
  });
});

const lines = [
  "A lightweight, floating wallpaper selector for macOS.",
  "Designed to work seamlessly with tiling window managers,",
  "like Aerospace and yabai.",
  "Open-source and customizable to your needs.",
];

const typewriterElement = document.getElementById("typewriter");

let lineIndex = 0;
let charIndex = 0;

function typeLine() {
  if (lineIndex >= lines.length) return;

  const currentLine = lines[lineIndex];
  if (charIndex < currentLine.length) {
    typewriterElement.textContent += currentLine.charAt(charIndex);
    charIndex++;
    setTimeout(typeLine, 40); // Typing speed per character
  } else {
    typewriterElement.textContent += "\n"; // Move to next line
    lineIndex++;
    charIndex = 0;
    setTimeout(typeLine, 500); // Delay before next line
  }
}

typeLine();
