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

  // --- Fetch Latest Release from GitHub ---
  const repo = "andrinoff/floatplane";
  const versionSpan = document.getElementById("latest-version");
  const downloadLink = document.getElementById("download-link");
  const installLink = document.getElementById("install-link");

  async function fetchLatestRelease() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/releases/latest`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const latestVersion = data.tag_name;
      const releaseUrl = data.html_url;

      if (versionSpan) {
        versionSpan.textContent = latestVersion;
      }
      if (downloadLink) {
        downloadLink.href = releaseUrl;
      }
      if (installLink) {
        installLink.href = releaseUrl;
      }
    } catch (error) {
      console.error("Could not fetch latest release:", error);
      if (versionSpan) {
        versionSpan.textContent = "N/A";
      }
    }
  }

  fetchLatestRelease();

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
