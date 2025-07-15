# Makefile for building and releasing the Hyprpaper Electron app

# Get the version from package.json to use for tagging the release.
VERSION := $(shell node -p "require('./package.json').version")

# Phony targets are not real files that are created by the make process.
.PHONY: all install package release publish clean

# The default command, executed when you just run `make`.
all: release

# Install npm dependencies. The `node_modules` directory is used as a marker
# to check if dependencies are already installed.
install: node_modules

node_modules: package.json
	@echo "--> Installing dependencies..."
	npm install
	touch node_modules # Create the marker file to prevent re-running

# Package the application for macOS. This command runs the `pack` script
# from your package.json, which should handle both building the React code
# and running electron-builder.
package: install
	@echo "--> Building and packaging the application..."
	npm run pack

# Create a clean release directory and move the final .dmg artifact into it.
release: package
	@echo "--> Creating release artifact..."
	# Create a clean release directory
	rm -rf release
	mkdir -p release
	# Find the generated .dmg file in the dist directory and move it.
	mv dist/*.dmg release/
	@echo "✅ Release complete! Find your .dmg in the 'release' directory."

# Publish the release to GitHub.
# This requires the GitHub CLI (`gh`) to be installed and authenticated.
publish: release
	@echo "--> Publishing release v$(VERSION) to GitHub..."
	# Check if the GitHub CLI is installed.
	@command -v gh >/dev/null 2>&1 || { echo >&2 "GitHub CLI 'gh' not found. Please install it to publish a release."; exit 1; }
	# Create a git tag for the version and push it.
	git tag v$(VERSION)
	git push origin v$(VERSION)
	# Create a GitHub release and upload the .dmg from the release folder.
	gh release create v$(VERSION) release/*.dmg --title "Release v$(VERSION)" --notes "New release of the wallpaper selector app."
	@echo "✅ Successfully published release v$(VERSION) to GitHub."

# Clean up all generated files and directories.
clean:
	@echo "--> Cleaning up project..."
	rm -rf node_modules
	rm -rf dist
	rm -rf release
	@echo "🧼 Clean complete."

