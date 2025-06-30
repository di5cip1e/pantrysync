#!/bin/bash

# Health check monitoring script
# Runs continuous health checks and reports status

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HEALTH_CHECK_INTERVAL=${HEALTH_CHECK_INTERVAL:-300} # 5 minutes
LOG_FILE="${SCRIPT_DIR}/../logs/health-check.log"
ALERT_THRESHOLD=${ALERT_THRESHOLD:-3} # Alert after 3 consecutive failures

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log messages
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Function to send alert (would integrate with actual alerting system)
send_alert() {
    local service="$1"
    local message="$2"
    local severity="$3"
    
    log_message "ALERT" "🚨 $severity: $service - $message"
    
    # In a real implementation, you would send to:
    # - Slack webhook
    # - Email notifications
    # - PagerDuty
    # - Discord webhook
    # - Teams webhook
    
    # For now, we'll just log it prominently
    echo "================== ALERT =================="
    echo "Service: $service"
    echo "Message: $message"
    echo "Severity: $severity"
    echo "Time: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    echo "==========================================="
}

# Function to check service health
check_service_health() {
    local service="$1"
    local url="$2"
    local expected_status="$3"
    local timeout="${4:-10}"
    
    log_message "INFO" "Checking $service health at $url"
    
    local response
    local status_code
    local response_time
    
    # Measure response time
    local start_time=$(date +%s%N)
    
    if response=$(curl -s -w "%{http_code}" --connect-timeout "$timeout" --max-time "$timeout" "$url" 2>/dev/null); then
        status_code="${response: -3}"
        response_body="${response%???}"
        local end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
        
        if [ "$status_code" -eq "$expected_status" ]; then
            log_message "SUCCESS" "✅ $service: Healthy (${response_time}ms, HTTP $status_code)"
            return 0
        else
            log_message "ERROR" "❌ $service: Unhealthy (${response_time}ms, HTTP $status_code, expected $expected_status)"
            return 1
        fi
    else
        log_message "ERROR" "❌ $service: Connection failed or timeout"
        return 1
    fi
}

# Function to check Firebase services
check_firebase_services() {
    log_message "INFO" "Checking Firebase services..."
    
    # Check Firebase Hosting
    if check_service_health "Firebase Hosting" "${DEPLOY_URL:-https://pantrysync-demo.web.app}" 200; then
        echo "✅ Firebase Hosting: Healthy"
    else
        send_alert "Firebase Hosting" "Service is down or responding incorrectly" "CRITICAL"
        return 1
    fi
    
    # In a real implementation, you would also check:
    # - Firestore (via REST API)
    # - Firebase Auth (via REST API)
    # - Firebase Storage (via REST API)
    
    return 0
}

# Function to check application functionality
check_application_functionality() {
    log_message "INFO" "Checking application functionality..."
    
    local base_url="${DEPLOY_URL:-https://pantrysync-demo.web.app}"
    local checks_passed=0
    local total_checks=0
    
    # Check main routes
    local routes=("/" "/auth" "/auth/signin" "/auth/signup")
    
    for route in "${routes[@]}"; do
        total_checks=$((total_checks + 1))
        if check_service_health "Route $route" "$base_url$route" 200; then
            checks_passed=$((checks_passed + 1))
        fi
    done
    
    # Calculate success rate
    if [ $total_checks -gt 0 ]; then
        local success_rate=$((checks_passed * 100 / total_checks))
        log_message "INFO" "Application functionality: $checks_passed/$total_checks checks passed ($success_rate%)"
        
        if [ $success_rate -lt 80 ]; then
            send_alert "Application Functionality" "Only $success_rate% of functionality checks passed" "WARNING"
            return 1
        fi
    fi
    
    return 0
}

# Function to check performance metrics
check_performance_metrics() {
    log_message "INFO" "Checking performance metrics..."
    
    local base_url="${DEPLOY_URL:-https://pantrysync-demo.web.app}"
    local start_time=$(date +%s%N)
    
    if curl -s --connect-timeout 10 --max-time 10 "$base_url" > /dev/null; then
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
        
        log_message "INFO" "Performance: Response time ${response_time}ms"
        
        # Performance thresholds
        if [ $response_time -gt 5000 ]; then
            send_alert "Performance" "Response time is ${response_time}ms (threshold: 5000ms)" "WARNING"
            return 1
        elif [ $response_time -gt 3000 ]; then
            log_message "WARN" "⚠️ Performance: Response time ${response_time}ms exceeds warning threshold (3000ms)"
        fi
    else
        send_alert "Performance" "Unable to measure response time - service may be down" "CRITICAL"
        return 1
    fi
    
    return 0
}

# Function to check security indicators
check_security_indicators() {
    log_message "INFO" "Checking security indicators..."
    
    local base_url="${DEPLOY_URL:-https://pantrysync-demo.web.app}"
    
    # Check HTTPS
    if curl -s --head "$base_url" | grep -i "strict-transport-security" > /dev/null; then
        log_message "SUCCESS" "✅ Security: HSTS header present"
    else
        log_message "WARN" "⚠️ Security: HSTS header missing"
    fi
    
    # Check for basic security headers
    local headers_response=$(curl -s --head "$base_url")
    
    if echo "$headers_response" | grep -i "x-frame-options" > /dev/null; then
        log_message "SUCCESS" "✅ Security: X-Frame-Options header present"
    else
        log_message "WARN" "⚠️ Security: X-Frame-Options header missing"
    fi
    
    return 0
}

# Function to run comprehensive health check
run_health_check() {
    log_message "INFO" "🏥 Starting comprehensive health check..."
    
    local overall_status=0
    
    # Run all checks
    check_firebase_services || overall_status=1
    check_application_functionality || overall_status=1
    check_performance_metrics || overall_status=1
    check_security_indicators || overall_status=1
    
    if [ $overall_status -eq 0 ]; then
        log_message "SUCCESS" "🎉 All health checks passed"
    else
        log_message "ERROR" "❌ Some health checks failed"
    fi
    
    return $overall_status
}

# Function to run continuous monitoring
run_continuous_monitoring() {
    log_message "INFO" "🔄 Starting continuous health monitoring (interval: ${HEALTH_CHECK_INTERVAL}s)"
    
    local consecutive_failures=0
    
    while true; do
        if run_health_check; then
            consecutive_failures=0
        else
            consecutive_failures=$((consecutive_failures + 1))
            
            if [ $consecutive_failures -ge $ALERT_THRESHOLD ]; then
                send_alert "System Health" "System has failed health checks $consecutive_failures consecutive times" "CRITICAL"
            fi
        fi
        
        log_message "INFO" "⏱️ Waiting ${HEALTH_CHECK_INTERVAL} seconds until next check..."
        sleep "$HEALTH_CHECK_INTERVAL"
    done
}

# Function to run one-time health check
run_single_check() {
    log_message "INFO" "🔍 Running single health check..."
    
    if run_health_check; then
        log_message "SUCCESS" "✅ Health check completed successfully"
        exit 0
    else
        log_message "ERROR" "❌ Health check failed"
        exit 1
    fi
}

# Main execution
main() {
    case "${1:-single}" in
        "continuous")
            run_continuous_monitoring
            ;;
        "single")
            run_single_check
            ;;
        *)
            echo "Usage: $0 [single|continuous]"
            echo "  single:     Run one-time health check (default)"
            echo "  continuous: Run continuous health monitoring"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"