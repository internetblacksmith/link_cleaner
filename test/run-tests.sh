#!/bin/bash

# run-tests.sh - Helper script to run cross-platform tests

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
PLATFORM="all"
DEVICE="android"
TAGS="@core"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --platform)
      PLATFORM="$2"
      shift 2
      ;;
    --device)
      DEVICE="$2"
      shift 2
      ;;
    --tags)
      TAGS="$2"
      shift 2
      ;;
    --help)
      echo "Usage: ./run-tests.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --platform [all|flutter|react-native]  Platform to test (default: all)"
      echo "  --device [android|ios]                 Device type (default: android)"
      echo "  --tags [tags]                          Cucumber tags (default: @core)"
      echo ""
      echo "Examples:"
      echo "  ./run-tests.sh --platform flutter --device ios"
      echo "  ./run-tests.sh --tags '@history and @core'"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}Link Cleaner Cross-Platform Tests${NC}"
echo "================================="
echo "Platform: $PLATFORM"
echo "Device: $DEVICE"
echo "Tags: $TAGS"
echo ""

# Check if Appium is installed
if ! command -v appium &> /dev/null; then
    echo -e "${RED}Error: Appium is not installed${NC}"
    echo "Run: npm install -g appium@next"
    exit 1
fi

# Start Appium server
echo -e "${YELLOW}Starting Appium server...${NC}"
appium --log-level error &
APPIUM_PID=$!
sleep 5

# Function to run tests
run_tests() {
    local platform=$1
    echo -e "${YELLOW}Running $platform tests...${NC}"
    
    PLATFORM=$platform DEVICE_TYPE=$DEVICE CUCUMBER_TAGS=$TAGS npm run test:$platform
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $platform tests passed${NC}"
    else
        echo -e "${RED}✗ $platform tests failed${NC}"
        return 1
    fi
}

# Run tests based on platform selection
case $PLATFORM in
    all)
        run_tests "flutter"
        FLUTTER_RESULT=$?
        run_tests "react-native"
        RN_RESULT=$?
        
        if [ $FLUTTER_RESULT -eq 0 ] && [ $RN_RESULT -eq 0 ]; then
            echo -e "${GREEN}✓ All tests passed!${NC}"
        else
            echo -e "${RED}✗ Some tests failed${NC}"
        fi
        ;;
    flutter|react-native)
        run_tests $PLATFORM
        ;;
    *)
        echo -e "${RED}Invalid platform: $PLATFORM${NC}"
        kill $APPIUM_PID
        exit 1
        ;;
esac

# Stop Appium server
echo -e "${YELLOW}Stopping Appium server...${NC}"
kill $APPIUM_PID

# Generate report
echo -e "${YELLOW}Generating test report...${NC}"
npm run report

echo -e "${GREEN}Test report available at: reports/cucumber-report.html${NC}"