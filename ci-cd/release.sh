#!/bin/bash

# Exit immediately if a command fails
set -e

# Check arguments
if [ "$#" -ne 2 ]; then
  echo "Usage: ./release.sh \"commit message\" <patch|minor|major>"
  exit 1
fi

COMMIT_MESSAGE="$1"
VERSION_TYPE="$2"

# Stage all changes
git add .

# Commit with your message
git commit -m "$COMMIT_MESSAGE"

# Bump version
npm version "$VERSION_TYPE" -m "Bump version to %s"

# Push commit and tags
git push
git push --tags

echo "✅ Done! Version bumped, committed, and pushed."
