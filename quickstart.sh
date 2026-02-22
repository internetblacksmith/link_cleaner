#!/bin/bash
# quickstart.sh - Quick setup and run script for Link Cleaner

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Link Cleaner - Quick Start       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check for required tools
check_requirements() {
    local missing=()
    
    echo -e "${YELLOW}Checking requirements...${NC}"
    
    command -v flutter >/dev/null 2>&1 || missing+=("Flutter")
    command -v node >/dev/null 2>&1 || missing+=("Node.js")
    command -v npm >/dev/null 2>&1 || missing+=("npm")
    command -v make >/dev/null 2>&1 || missing+=("make")
    
    if [ ${#missing[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required tools: ${missing[*]}${NC}"
        echo -e "${YELLOW}Please install the missing tools and try again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements met!${NC}"
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "=========================="
    echo "1) Setup development environment"
    echo "2) Run Flutter app"
    echo "3) Run React Native app"
    echo "4) Run tests"
    echo "5) Build for production"
    echo "6) Clean everything"
    echo "7) Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
}

# Execute based on choice
execute_choice() {
    case $choice in
        1)
            echo -e "\n${YELLOW}Setting up development environment...${NC}"
            make setup
            echo -e "${GREEN}✅ Setup complete!${NC}"
            ;;
        2)
            echo -e "\n${YELLOW}Starting Flutter app...${NC}"
            make dev-flutter
            ;;
        3)
            echo -e "\n${YELLOW}Starting React Native app...${NC}"
            echo "Select platform:"
            echo "1) Android"
            echo "2) iOS"
            read -p "Enter choice (1-2): " platform
            if [ "$platform" == "1" ]; then
                make dev-rn-android
            else
                make dev-rn-ios
            fi
            ;;
        4)
            echo -e "\n${YELLOW}Running tests...${NC}"
            echo "Select test type:"
            echo "1) Unit tests only"
            echo "2) Integration tests only"
            echo "3) All tests"
            read -p "Enter choice (1-3): " test_type
            case $test_type in
                1) make test-unit ;;
                2) make test-integration ;;
                3) make test ;;
            esac
            ;;
        5)
            echo -e "\n${YELLOW}Building for production...${NC}"
            echo "Select platform:"
            echo "1) Flutter only"
            echo "2) React Native only"
            echo "3) Both platforms"
            read -p "Enter choice (1-3): " build_choice
            case $build_choice in
                1) make build-flutter ;;
                2) make build-rn ;;
                3) make build ;;
            esac
            ;;
        6)
            echo -e "\n${YELLOW}Cleaning build artifacts...${NC}"
            make clean
            echo -e "${GREEN}✅ Clean complete!${NC}"
            ;;
        7)
            echo -e "\n${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            ;;
    esac
}

# Main loop
check_requirements

while true; do
    show_menu
    execute_choice
    echo ""
    read -p "Press Enter to continue..."
done