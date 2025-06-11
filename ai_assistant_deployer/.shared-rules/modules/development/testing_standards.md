# Development Testing Standards Module

**Module ID**: `development.testing_standards`  
**Dependencies**: `core.workflow_core`, `development.clean_architecture`  
**Performance Impact**: Low (adds 0.3s startup)  
**Memory Usage**: ~6MB  

## Overview
This module defines comprehensive testing standards, quality assurance processes, and automated testing requirements for development projects.

## Rules Consolidated
- **Rule #6**: Testing and quality assurance standards
- **Rule #8**: Code review and testing requirements
- **Rule #11**: Automated testing implementation

## Testing Strategy

### Testing Pyramid
```
    /\     E2E Tests (10%)
   /  \    Integration Tests (20%)
  /____\   Unit Tests (70%)
```

### Test Coverage Requirements
- **Unit Tests**: Minimum 80% code coverage
- **Integration Tests**: Cover all API endpoints and data flows
- **E2E Tests**: Cover critical user journeys
- **Performance Tests**: Load and stress testing for key scenarios

## Testing Standards by Type

### Unit Testing
- **Framework**: Jest, Mocha, XUnit, etc. (language-appropriate)
- **Coverage**: 80% minimum, 90% target
- **Test Structure**: Arrange-Act-Assert pattern
- **Mocking**: External dependencies must be mocked
- **Fast**: Each test should run in < 50ms

```javascript
// Example Unit Test Structure
describe('UserService', () => {
  it('should create user with valid data', async () => {
    // Arrange
    const userData = { name: 'John', email: 'john@example.com' };
    const mockRepository = jest.fn().mockResolvedValue(userData);
    
    // Act
    const result = await userService.createUser(userData);
    
    // Assert
    expect(result).toEqual(expect.objectContaining(userData));
    expect(mockRepository).toHaveBeenCalledWith(userData);
  });
});
```

### Integration Testing
- **Database**: Test with real database (test environment)
- **APIs**: Test actual HTTP requests/responses
- **External Services**: Use contract testing or test doubles
- **Data**: Use test fixtures and clean up after tests

### End-to-End Testing
- **Tools**: Cypress, Selenium, Playwright
- **Environment**: Staging environment
- **Data**: Use dedicated test data
- **Scenarios**: Critical user paths only

### Performance Testing
- **Load Testing**: Expected user load
- **Stress Testing**: Breaking point identification
- **Spike Testing**: Sudden traffic increases
- **Volume Testing**: Large data sets

## Quality Assurance Process

### Pre-Commit Checks
```bash
# Automated pre-commit hooks
1. Code formatting (Prettier, Black, etc.)
2. Linting (ESLint, Pylint, etc.)
3. Type checking (TypeScript, mypy, etc.)
4. Unit tests execution
5. Security scanning
```

### Continuous Integration
```yaml
# CI Pipeline Requirements
stages:
  - lint_and_format
  - unit_tests
  - integration_tests
  - security_scan
  - build
  - deploy_to_staging
  - e2e_tests
  - performance_tests
```

### Code Review Checklist
- [ ] **Functionality**: Does the code work as intended?
- [ ] **Tests**: Are there adequate tests with good coverage?
- [ ] **Performance**: Are there any performance concerns?
- [ ] **Security**: Are there security vulnerabilities?
- [ ] **Maintainability**: Is the code readable and maintainable?
- [ ] **Documentation**: Is the code properly documented?

## Test Data Management

### Test Data Strategy
- **Synthetic Data**: Generated test data for consistency
- **Data Masking**: Anonymized production data where needed
- **Test Fixtures**: Reusable test data sets
- **Data Cleanup**: Automated cleanup after tests

### Database Testing
```sql
-- Test data setup example
BEGIN TRANSACTION;
INSERT INTO users (id, name, email) VALUES 
  (1, 'Test User 1', 'test1@example.com'),
  (2, 'Test User 2', 'test2@example.com');
-- Test execution
-- Cleanup
ROLLBACK TRANSACTION;
```

## Testing Environment Management

### Environment Separation
- **Local**: Developer machines
- **Development**: Shared development environment
- **Testing**: Dedicated testing environment
- **Staging**: Production-like environment
- **Production**: Live environment

### Environment Consistency
- **Infrastructure as Code**: Identical configurations
- **Containerization**: Docker for consistency
- **Configuration Management**: Environment-specific configs
- **Data Synchronization**: Regular data refresh

## Automated Testing Tools

### Testing Frameworks
```bash
# Frontend Testing
- Jest (Unit testing)
- React Testing Library (Component testing)
- Cypress (E2E testing)

# Backend Testing  
- JUnit (Java)
- pytest (Python)
- Mocha/Jest (Node.js)

# Mobile Testing
- XCTest (iOS)
- Espresso (Android)
- Detox (React Native)
```

### Quality Metrics
- **Test Coverage**: Code coverage percentage
- **Test Execution Time**: CI pipeline duration
- **Test Reliability**: Flaky test detection
- **Defect Density**: Bugs per lines of code
- **Test Automation Ratio**: Automated vs manual tests

## Performance and Load Testing

### Load Testing Strategy
```bash
# Performance test scenarios
1. Normal load (expected users)
2. Peak load (2x normal)
3. Stress testing (breaking point)
4. Endurance testing (extended periods)
5. Spike testing (sudden increases)
```

### Performance Criteria
- **Response Time**: 95th percentile < 200ms
- **Throughput**: Handle expected RPS
- **Resource Usage**: CPU < 70%, Memory < 80%
- **Error Rate**: < 0.1% under normal load

## Test Reporting and Metrics

### Test Reports
- **Coverage Reports**: HTML coverage reports
- **Test Results**: JUnit XML format
- **Performance Reports**: Response time distributions
- **Security Reports**: Vulnerability assessments

### Quality Gates
```yaml
# Quality gate criteria
quality_gates:
  unit_test_coverage: 80%
  integration_test_pass_rate: 100%
  performance_threshold: 200ms
  security_vulnerabilities: 0_critical
  code_duplication: <5%
```

---
*Module Status: Active | Last Updated: $(date) | Version: 1.0* 