#!/bin/bash

# Banking API Test Suite Setup & Runner
# Version: 2.0.0
# Author: Banking API Development Team

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis for better UX
CHECK="✅"
CROSS="❌"
ROCKET="🚀"
PACKAGE="📦"
SEARCH="🔍"
BANK="🏦"
GEAR="⚙️"
CLOCK="⏰"
CHART="📊"
SHIELD="🛡️"

echo -e "${CYAN}${BANK} Banking API Test Suite Setup & Runner${NC}"
echo -e "${CYAN}==============================================${NC}"
echo ""

# Function to print colored messages
print_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

print_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${PURPLE}${GEAR} $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for server
wait_for_server() {
    local url=$1
    local max_attempts=${2:-30}
    local attempt=1
    
    print_step "Waiting for server to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s --max-time 2 "$url" >/dev/null 2>&1; then
            return 0
        fi
        
        echo -ne "\r${CLOCK} Attempt $attempt/$max_attempts - Waiting for server..."
        sleep 1
        ((attempt++))
    done
    
    echo ""
    return 1
}

# Parse command line arguments
VERBOSE=false
DEBUG=false
QUIET=false
SERVER_URL="http://localhost:3000"
SKIP_SETUP=false
AUTO_START_SERVER=false
TEST_TIMEOUT=10000

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--debug)
            DEBUG=true
            shift
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -u|--url)
            SERVER_URL="$2"
            shift 2
            ;;
        --skip-setup)
            SKIP_SETUP=true
            shift
            ;;
        --auto-start)
            AUTO_START_SERVER=true
            shift
            ;;
        --timeout)
            TEST_TIMEOUT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Banking API Test Suite Runner"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -v, --verbose      Enable verbose test output"
            echo "  -d, --debug        Enable debug mode with full request/response data"
            echo "  -q, --quiet        Suppress non-essential output"
            echo "  -u, --url URL      API base URL (default: http://localhost:3000)"
            echo "  --skip-setup       Skip dependency installation and checks"
            echo "  --auto-start       Attempt to start server automatically"
            echo "  --timeout MS       Request timeout in milliseconds (default: 10000)"
            echo "  -h, --help         Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                 # Run with default settings"
            echo "  $0 --verbose       # Run with verbose output"
            echo "  $0 --debug         # Run with debug information"
            echo "  $0 --url http://localhost:8000  # Test against different URL"
            echo "  $0 --skip-setup --quiet         # Quick run without setup"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# System Requirements Check
if ! $SKIP_SETUP; then
    print_step "Checking system requirements..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed"
        print_info "Please install Node.js from: https://nodejs.org/"
        print_info "Minimum required version: 18.0.0"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    print_success "Node.js $NODE_VERSION is installed"
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed"
        print_info "npm usually comes with Node.js installation"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm $NPM_VERSION is installed"
    
    # Check curl
    if ! command_exists curl; then
        print_error "curl is not installed"
        print_info "Please install curl for server connectivity testing"
        exit 1
    fi
    
    print_success "All system requirements met"
    echo ""
fi

# Dependency Installation
if ! $SKIP_SETUP; then
    print_step "Checking project dependencies..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_warning "package.json not found, creating minimal package.json..."
        cat > package.json << EOF
{
  "name": "banking-api-tests",
  "version": "1.0.0",
  "type": "module",
  "description": "Banking API Test Suite",
  "scripts": {
    "test": "node comprehensive-api-test.js",
    "test:verbose": "node comprehensive-api-test.js --verbose",
    "test:debug": "node comprehensive-api-test.js --debug",
    "test:quiet": "node comprehensive-api-test.js --quiet"
  },
  "devDependencies": {
    "commander": "^11.0.0",
    "node-fetch": "^3.3.2",
    "chalk": "^5.3.0"
  }
}
EOF
        print_success "Created package.json"
    fi
    
    # Install dependencies if node_modules doesn't exist or is incomplete
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        print_step "Installing test dependencies..."
        
        if $QUIET; then
            npm install --silent >/dev/null 2>&1
        else
            npm install
        fi
        
        print_success "Dependencies installed successfully"
    else
        # Check if required packages are installed
        MISSING_DEPS=()
        
        if [ ! -d "node_modules/commander" ]; then
            MISSING_DEPS+=("commander")
        fi
        if [ ! -d "node_modules/node-fetch" ]; then
            MISSING_DEPS+=("node-fetch")
        fi
        if [ ! -d "node_modules/chalk" ]; then
            MISSING_DEPS+=("chalk")
        fi
        
        if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
            print_warning "Missing dependencies: ${MISSING_DEPS[*]}"
            print_step "Installing missing dependencies..."
            
            if $QUIET; then
                npm install --save-dev "${MISSING_DEPS[@]}" --silent >/dev/null 2>&1
            else
                npm install --save-dev "${MISSING_DEPS[@]}"
            fi
            
            print_success "Missing dependencies installed"
        else
            print_success "All dependencies are already installed"
        fi
    fi
    
    echo ""
fi

# Test Script Verification
print_step "Verifying test script..."

if [ ! -f "comprehensive-api-test.js" ]; then
    print_error "Test script 'comprehensive-api-test.js' not found"
    print_info "Please ensure the test script is in the current directory"
    exit 1
fi

print_success "Test script found"

# Server Connectivity Check
print_step "Checking server connectivity..."

# Extract host and port from URL
if [[ $SERVER_URL =~ ^https?://([^:]+):([0-9]+) ]]; then
    HOST="${BASH_REMATCH[1]}"
    PORT="${BASH_REMATCH}"
elif [[ $SERVER_URL =~ ^https?://([^:/]+) ]]; then
    HOST="${BASH_REMATCH[1]}"
    PORT="80"
    if [[ $SERVER_URL =~ ^https ]]; then
        PORT="443"
    fi
else
    print_error "Invalid server URL format: $SERVER_URL"
    exit 1
fi

print_info "Testing connectivity to $HOST:$PORT..."

# Check if server is responding
if wait_for_server "$SERVER_URL" 5; then
    print_success "Server is responding at $SERVER_URL"
else
    if $AUTO_START_SERVER && [ -f "server.js" ]; then
        print_warning "Server not responding, attempting to start..."
        
        # Try to start server in background
        if command_exists npm && [ -f "package.json" ]; then
            print_step "Starting server with npm start..."
            npm start > server.log 2>&1 &
            SERVER_PID=$!
            
            # Wait for server to start
            if wait_for_server "$SERVER_URL" 20; then
                print_success "Server started successfully (PID: $SERVER_PID)"
                
                # Create cleanup function
                cleanup_server() {
                    if kill -0 $SERVER_PID 2>/dev/null; then
                        print_info "Stopping server (PID: $SERVER_PID)..."
                        kill $SERVER_PID
                        print_success "Server stopped"
                    fi
                }
                
                # Set trap to cleanup on exit
                trap cleanup_server EXIT
            else
                print_error "Failed to start server automatically"
                print_info "Please start your server manually and try again"
                exit 1
            fi
        else
            print_error "Cannot auto-start server: npm or package.json not found"
            exit 1
        fi
    else
        print_error "Server is not running at $SERVER_URL"
        print_info "Please start your server first with one of these commands:"
        print_info "  npm start"
        print_info "  node server.js"
        print_info "  npm run dev"
        print_info ""
        print_info "Or use --auto-start flag to attempt automatic server startup"
        exit 1
    fi
fi

echo ""

# Pre-test Information
if ! $QUIET; then
    print_step "Test Configuration:"
    echo -e "  ${BLUE}Server URL:${NC} $SERVER_URL"
    echo -e "  ${BLUE}Test Timeout:${NC} ${TEST_TIMEOUT}ms"
    echo -e "  ${BLUE}Verbose Mode:${NC} $VERBOSE"
    echo -e "  ${BLUE}Debug Mode:${NC} $DEBUG"
    echo -e "  ${BLUE}Quiet Mode:${NC} $QUIET"
    echo ""
fi

# Build test command
TEST_CMD="node comprehensive-api-test.js"

if [ "$SERVER_URL" != "http://localhost:3000" ]; then
    TEST_CMD="$TEST_CMD --url $SERVER_URL"
fi

if [ "$TEST_TIMEOUT" != "10000" ]; then
    TEST_CMD="$TEST_CMD --timeout $TEST_TIMEOUT"
fi

if $VERBOSE; then
    TEST_CMD="$TEST_CMD --verbose"
fi

if $DEBUG; then
    TEST_CMD="$TEST_CMD --debug"
fi

if $QUIET; then
    TEST_CMD="$TEST_CMD --quiet"
fi

# Execute Tests
echo -e "${CYAN}${ROCKET} Running Banking API Comprehensive Tests${NC}"
echo -e "${CYAN}===============================================${NC}"
echo ""

if ! $QUIET; then
    print_info "Executing: $TEST_CMD"
    echo ""
fi

# Record start time
START_TIME=$(date +%s)

# Run the tests and capture exit code
set +e  # Don't exit on error for test execution
eval $TEST_CMD
TEST_EXIT_CODE=$?
set -e

# Record end time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo -e "${CYAN}=============================================${NC}"

# Test Results Summary
if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All tests completed successfully!"
    echo -e "${GREEN}${CHART} Test execution completed in ${DURATION}s${NC}"
else
    print_error "Some tests failed (Exit code: $TEST_EXIT_CODE)"
    echo -e "${RED}${CHART} Test execution completed in ${DURATION}s${NC}"
fi

echo ""

# Additional Testing Resources
if ! $QUIET; then
    echo -e "${BLUE}📋 Additional Testing Options:${NC}"
    echo -e "${BLUE}=============================${NC}"
    echo "1. Manual Testing:"
    echo "   • Import Postman collection (if available)"
    echo "   • Use Thunder Client in VS Code"
    echo "   • Test individual endpoints with curl"
    echo ""
    echo "2. Automated Testing:"
    echo "   • npm run test:verbose    # Detailed output"
    echo "   • npm run test:debug      # Full debug info"
    echo "   • npm run test:quiet      # Minimal output"
    echo ""
    echo "3. Continuous Testing:"
    echo "   • nodemon comprehensive-api-test.js"
    echo "   • Watch mode for development"
    echo ""
    echo "4. Custom Testing:"
    echo "   • $0 --url http://staging.api.com"
    echo "   • $0 --debug --no-cleanup"
    echo "   • $0 --timeout 5000"
fi

# Performance Tips
if $DEBUG || $VERBOSE; then
    echo ""
    echo -e "${PURPLE}🔧 Performance & Debugging Tips:${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo "• Check server logs for detailed error information"
    echo "• Monitor database connections during tests"
    echo "• Use --debug flag for full request/response inspection"
    echo "• Verify network connectivity if tests timeout"
    echo "• Check available system resources (RAM, CPU)"
fi

# Security Reminders
if ! $QUIET; then
    echo ""
    echo -e "${YELLOW}${SHIELD} Security Reminders:${NC}"
    echo -e "${YELLOW}===================${NC}"
    echo "• Test data is automatically cleaned up"
    echo "• Use test database, never production"
    echo "• Verify API authentication is working"
    echo "• Check for proper input validation"
    echo "• Ensure sensitive data is not logged"
fi

echo ""
print_success "Test suite execution completed!"

# Exit with the same code as the test execution
exit $TEST_EXIT_CODE
