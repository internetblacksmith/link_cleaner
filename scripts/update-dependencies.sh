#!/bin/bash

# update-dependencies.sh - Update all dependencies to latest versions

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📦 Updating Dependencies to Latest Versions${NC}"
echo "==========================================="

# Function to update React Native dependencies
update_react_native_deps() {
    echo -e "\n${YELLOW}Updating React Native dependencies...${NC}"
    
    cd react_native
    
    # Install npm-check-updates if not present
    if ! command -v ncu &> /dev/null; then
        echo "Installing npm-check-updates..."
        npm install -g npm-check-updates
    fi
    
    # Show what will be updated
    echo -e "\n${BLUE}Checking for updates...${NC}"
    ncu
    
    # Update all dependencies
    echo -e "\n${YELLOW}Updating dependencies...${NC}"
    ncu -u
    
    # Install updated dependencies
    echo -e "\n${YELLOW}Installing updated dependencies...${NC}"
    npm install
    
    # Run audit fix
    echo -e "\n${YELLOW}Running security audit...${NC}"
    npm audit fix || true
    
    cd ..
}

# Function to update Flutter dependencies  
update_flutter_deps() {
    echo -e "\n${YELLOW}Updating Flutter dependencies...${NC}"
    
    cd flutter
    
    # Update Flutter SDK first
    echo -e "\n${BLUE}Updating Flutter SDK...${NC}"
    flutter upgrade
    
    # Get latest versions
    echo -e "\n${BLUE}Checking for dependency updates...${NC}"
    flutter pub outdated
    
    # Upgrade dependencies
    echo -e "\n${YELLOW}Upgrading dependencies...${NC}"
    flutter pub upgrade --major-versions
    
    # Get dependencies
    flutter pub get
    
    cd ..
}

# Function to check for breaking changes
check_breaking_changes() {
    echo -e "\n${YELLOW}Checking for potential breaking changes...${NC}"
    
    # Check React Native
    echo -e "\n${BLUE}React Native breaking changes:${NC}"
    cd react_native
    npm outdated | grep -E "(MAJOR|react-native)" || echo "No major updates found"
    cd ..
    
    # Check Flutter  
    echo -e "\n${BLUE}Flutter breaking changes:${NC}"
    cd flutter
    flutter pub outdated | grep -E "(MAJOR|BREAKING)" || echo "No major updates found"
    cd ..
}

# Main execution
echo -e "${BLUE}Starting dependency update process...${NC}"

# Create backups
echo -e "\n${YELLOW}Creating backups...${NC}"
cp react_native/package.json react_native/package.json.backup.$(date +%Y%m%d_%H%M%S)
cp react_native/package-lock.json react_native/package-lock.json.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp flutter/pubspec.yaml flutter/pubspec.yaml.backup.$(date +%Y%m%d_%H%M%S)
cp flutter/pubspec.lock flutter/pubspec.lock.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Update dependencies
update_react_native_deps
update_flutter_deps

# Check for breaking changes
check_breaking_changes

echo -e "\n${GREEN}✅ All dependencies have been updated!${NC}"
echo -e "${YELLOW}Note: Backup files created with timestamp${NC}"
echo -e "${YELLOW}Run 'make deps-pin' to pin to exact versions${NC}"
echo -e "${YELLOW}Run 'make test' to ensure everything still works${NC}"