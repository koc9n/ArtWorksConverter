#!/bin/bash

# Configuration
API_URL="http://localhost:3000"
REQUESTS_PER_MINUTE=1000
TEST_DURATION_MINUTES=2
TEST_VIDEO_PATH="$(dirname "$0")/data/test_me.mp4"
TOTAL_USERS=50

# Calculate delay between requests to achieve desired rate
# 60 seconds / 1000 requests = 0.06 seconds between requests
DELAY=0.06

# Verify test file exists
if [ ! -f "$TEST_VIDEO_PATH" ]; then
    echo "❌ Test video file not found: $TEST_VIDEO_PATH"
    exit 1
fi
echo "✅ Found test video file: $TEST_VIDEO_PATH"

# Function to login and get token
login_user() {
    local email="user$1@test.com"
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$email\", \"password\": \"password123\"}" \
        "$API_URL/auth/login")
    
    # Check if login was successful
    if [ $? -ne 0 ]; then
        echo "Login failed for $email"
        return 1
    fi
    
    local token=$(echo "$response" | jq -r '.token')
    if [ "$token" = "null" ] || [ -z "$token" ]; then
        echo "Failed to get token for $email. Response: $response"
        return 1
    fi
    echo "$token"
}

# Store tokens in a simple format
USER_TOKENS=""

# Login all test users first
echo "Logging in test users..."
for i in $(seq 1 $TOTAL_USERS); do
    token=$(login_user "$i")
    if [ $? -eq 0 ]; then
        USER_TOKENS="$USER_TOKENS|$token"
        echo "✅ Logged in user$i@test.com"
    else
        echo "❌ Failed to login user$i@test.com"
        exit 1
    fi
done

# Function to get random token
get_random_token() {
    local tokens
    IFS='|' read -ra tokens <<< "$USER_TOKENS"
    local index=$((1 + RANDOM % TOTAL_USERS))
    echo "${tokens[$index]}"
}

# Function to send conversion request
send_request() {
    # Get random user token
    local token=$(get_random_token)
    local user_index=$((1 + RANDOM % TOTAL_USERS))
    
    # Send request and capture response
    local response=$(curl -s -X POST \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: multipart/form-data" \
        -H "Accept: application/json" \
        -F "file=@$TEST_VIDEO_PATH;type=video/mp4" \
        "$API_URL/convert")
    
    # Check if request was successful and add debug logging
    echo "Debug - Curl Response: $response"
    if [ $? -eq 0 ]; then
        local status=$(echo "$response" | jq -r '.message // empty')
        if [ ! -z "$status" ]; then
            echo "✅ Request successful with user$user_index@test.com"
            return 0
        fi
    fi
    
    echo "❌ Request failed with user$user_index@test.com. Response: $response"
    return 1
}

# Calculate total requests
TOTAL_REQUESTS=$((REQUESTS_PER_MINUTE * TEST_DURATION_MINUTES))

echo "Starting load test..."
echo "Target: $REQUESTS_PER_MINUTE requests per minute"
echo "Duration: $TEST_DURATION_MINUTES minutes"
echo "Total requests: $TOTAL_REQUESTS"

# Start time
START_TIME=$(date +%s)

# Counters for requests
SUCCESSFUL_REQUESTS=0
FAILED_REQUESTS=0

# Send requests
for i in $(seq 1 $TOTAL_REQUESTS); do
    if send_request; then
        SUCCESSFUL_REQUESTS=$((SUCCESSFUL_REQUESTS + 1))
    else
        FAILED_REQUESTS=$((FAILED_REQUESTS + 1))
    fi
    
    # Sleep to maintain rate
    # sleep "$DELAY"
    
    # Show progress every 100 requests
    if [ $((i % 100)) -eq 0 ]; then
        echo "Progress: $i/$TOTAL_REQUESTS requests"
        echo "Success: $SUCCESSFUL_REQUESTS, Failed: $FAILED_REQUESTS"
    fi
done

# End time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Print results
echo "Load test completed!"
echo "Duration: $DURATION seconds"
echo "Successful requests: $SUCCESSFUL_REQUESTS"
echo "Failed requests: $FAILED_REQUESTS"
echo "Average rate: $(bc <<< "scale=2; $SUCCESSFUL_REQUESTS / ($DURATION / 60)") requests/minute"

# Check if we met the target rate
TARGET_RATE=$REQUESTS_PER_MINUTE
ACTUAL_RATE=$(bc <<< "scale=2; $SUCCESSFUL_REQUESTS / ($DURATION / 60)")
if (( $(echo "$ACTUAL_RATE >= $TARGET_RATE" | bc -l) )); then
    echo "✅ Target rate achieved!"
else
    echo "❌ Failed to achieve target rate"
fi 