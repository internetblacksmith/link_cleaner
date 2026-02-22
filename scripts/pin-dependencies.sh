#!/bin/bash

# pin-dependencies.sh - Pin all dependencies to exact versions

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📌 Pinning Dependencies to Exact Versions${NC}"
echo "========================================="

# Function to pin React Native dependencies
pin_react_native_deps() {
    echo -e "\n${YELLOW}Pinning React Native dependencies...${NC}"
    
    cd react_native
    
    # Create a backup
    cp package.json package.json.backup
    
    # Get the actual installed versions from package-lock.json
    if [ -f "package-lock.json" ]; then
        echo "Using package-lock.json to determine exact versions..."
        
        # Extract exact versions and update package.json
        node -e '
        const fs = require("fs");
        const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
        const packageLock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
        
        function getExactVersion(name, currentSpec) {
            // Check in dependencies
            if (packageLock.packages && packageLock.packages["node_modules/" + name]) {
                return packageLock.packages["node_modules/" + name].version;
            }
            // Fallback to current spec without range operators
            return currentSpec.replace(/[\^~><=]/g, "");
        }
        
        // Update dependencies
        if (packageJson.dependencies) {
            Object.keys(packageJson.dependencies).forEach(dep => {
                const exactVersion = getExactVersion(dep, packageJson.dependencies[dep]);
                packageJson.dependencies[dep] = exactVersion;
                console.log(`  ${dep}: ${exactVersion}`);
            });
        }
        
        // Update devDependencies
        if (packageJson.devDependencies) {
            Object.keys(packageJson.devDependencies).forEach(dep => {
                const exactVersion = getExactVersion(dep, packageJson.devDependencies[dep]);
                packageJson.devDependencies[dep] = exactVersion;
                console.log(`  ${dep}: ${exactVersion} (dev)`);
            });
        }
        
        // Write updated package.json
        fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2) + "\n");
        '
        
        echo -e "${GREEN}✅ React Native dependencies pinned${NC}"
    else
        echo -e "${YELLOW}No package-lock.json found. Running npm install first...${NC}"
        npm install
        # Recursively call this function now that we have package-lock.json
        pin_react_native_deps
        return
    fi
    
    cd ..
}

# Function to pin Flutter dependencies
pin_flutter_deps() {
    echo -e "\n${YELLOW}Pinning Flutter dependencies...${NC}"
    
    cd flutter
    
    # Create a backup
    cp pubspec.yaml pubspec.yaml.backup
    
    # Flutter already uses exact versions in pubspec.lock
    # We need to update pubspec.yaml to match pubspec.lock
    
    if [ -f "pubspec.lock" ]; then
        echo "Updating pubspec.yaml with exact versions from pubspec.lock..."
        
        # Use a Python script to parse YAML properly
        python3 -c '
import yaml
import re

# Read files
with open("pubspec.yaml", "r") as f:
    pubspec = yaml.safe_load(f)

with open("pubspec.lock", "r") as f:
    lockfile = yaml.safe_load(f)

# Update dependencies with exact versions from lockfile
if "dependencies" in pubspec and "packages" in lockfile:
    for dep in pubspec["dependencies"]:
        if dep in lockfile["packages"] and "version" in lockfile["packages"][dep]:
            version = lockfile["packages"][dep]["version"]
            pubspec["dependencies"][dep] = version
            print(f"  {dep}: {version}")

# Update dev_dependencies
if "dev_dependencies" in pubspec and "packages" in lockfile:
    for dep in pubspec["dev_dependencies"]:
        if dep in lockfile["packages"] and "version" in lockfile["packages"][dep]:
            version = lockfile["packages"][dep]["version"]
            pubspec["dev_dependencies"][dep] = version
            print(f"  {dep}: {version} (dev)")

# Write updated pubspec.yaml
with open("pubspec.yaml", "w") as f:
    yaml.dump(pubspec, f, default_flow_style=False, sort_keys=False)
' || {
            echo -e "${YELLOW}Python YAML parsing failed. Using sed as fallback...${NC}"
            
            # Fallback: Remove ^ and ~ from version constraints
            sed -i.bak -E 's/(\s+\w+:\s*)\^/\1/g' pubspec.yaml
            sed -i.bak -E 's/(\s+\w+:\s*)~/\1/g' pubspec.yaml
            rm pubspec.yaml.bak
        }
        
        echo -e "${GREEN}✅ Flutter dependencies pinned${NC}"
    else
        echo -e "${YELLOW}No pubspec.lock found. Running flutter pub get first...${NC}"
        flutter pub get
        # Recursively call this function
        pin_flutter_deps
        return
    fi
    
    cd ..
}

# Main execution
echo -e "${BLUE}Starting dependency pinning process...${NC}"

# Pin React Native dependencies
pin_react_native_deps

# Pin Flutter dependencies
pin_flutter_deps

echo -e "\n${GREEN}✅ All dependencies have been pinned to exact versions!${NC}"
echo -e "${YELLOW}Note: Backup files created as package.json.backup and pubspec.yaml.backup${NC}"
echo -e "${YELLOW}Run 'make deps-install' to ensure everything is properly installed${NC}"