document.addEventListener("DOMContentLoaded", () => {
  // Smooth scrolling for anchor links
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

  // --- Fetch Latest Release and Stars from GitHub ---
  const repo = "andrinoff/floatplane";
  const versionSpan = document.getElementById("latest-version");
  const installLink = document.getElementById("install-link");
  const starsSpan = document.getElementById("github-stars");

  async function fetchRepoInfo() {
    try {
      // Fetch release info
      const releaseResponse = await fetch(
        `https://api.github.com/repos/${repo}/releases/latest`
      );
      if (!releaseResponse.ok) {
        throw new Error(`HTTP error! status: ${releaseResponse.status}`);
      }
      const releaseData = await releaseResponse.json();
      const latestVersion = releaseData.tag_name;
      const releaseUrl = releaseData.html_url;

      if (versionSpan) {
        versionSpan.textContent = latestVersion;
      }
      if (installLink) {
        installLink.href = releaseUrl;
      }

      // Fetch repo info for stars
      const repoResponse = await fetch(`https://api.github.com/repos/${repo}`);
      if (!repoResponse.ok) {
        throw new Error(`HTTP error! status: ${repoResponse.status}`);
      }
      const repoData = await repoResponse.json();
      const starCount = repoData.stargazers_count;

      if (starsSpan) {
        starsSpan.textContent = starCount;
      }
    } catch (error) {
      console.error("Could not fetch GitHub data:", error);
      if (versionSpan) {
        versionSpan.textContent = "N/A";
      }
      if (starsSpan) {
        starsSpan.textContent = "N/A";
      }
    }
  }

  fetchRepoInfo();

  // Interactive hover effects for feature cards
  document.querySelectorAll(".feature-card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
      this.style.borderColor = "var(--accent)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.borderColor = "var(--border)";
    });
  });
});
// --- Initialize Clipboard.js ---
const clipboard = new ClipboardJS(".copy-btn");

clipboard.on("success", function (e) {
  const originalText = e.trigger.textContent;
  e.trigger.textContent = "Copied!";
  setTimeout(() => {
    e.trigger.textContent = originalText;
  }, 2000);
  e.clearSelection();
});

clipboard.on("error", function (e) {
  console.error("Action:", e.action);
  console.error("Trigger:", e.trigger);
  // You can add a fallback here, e.g., prompt the user to copy manually.
});
