#!/bin/bash

# Simple workflow validation script
# Checks for common issues in GitHub Actions workflows

WORKFLOW_FILE=".github/workflows/ci.yml"

echo "Validating GitHub Actions workflow: $WORKFLOW_FILE"
echo ""

# Check if file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
  echo "❌ ERROR: Workflow file not found: $WORKFLOW_FILE"
  exit 1
fi

echo "✓ Workflow file exists"

# Check for required fields
if ! grep -q "^name:" "$WORKFLOW_FILE"; then
  echo "❌ ERROR: Missing 'name' field"
  exit 1
fi

if ! grep -q "^on:" "$WORKFLOW_FILE"; then
  echo "❌ ERROR: Missing 'on:' trigger"
  exit 1
fi

if ! grep -q "^jobs:" "$WORKFLOW_FILE"; then
  echo "❌ ERROR: Missing 'jobs:' section"
  exit 1
fi

echo "✓ Required fields present"

# Check for jobs
JOBS=$(grep -E "^  [a-z]+:" "$WORKFLOW_FILE" | sed 's/://g' | sed 's/^  //')
echo ""
echo "Jobs found:"
for job in $JOBS; do
  echo "  - $job"
done

echo ""
echo "✓ Basic validation passed!"
echo ""
echo "To validate YAML syntax more thoroughly, you can:"
echo "  1. Push to a test branch and check GitHub Actions tab"
echo "  2. Use online YAML validators"
echo "  3. Install actionlint: brew install actionlint (macOS)"
echo ""

