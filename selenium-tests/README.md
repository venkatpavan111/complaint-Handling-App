# ResolveQ Web Frontend - Selenium E2E Automation Test Suite

Comprehensive Selenium WebDriver End-to-End (E2E) testing suite and automated Excel QA reporting system for the **ResolveQ** Campus Grievance & Complaint Redressal web application frontend.

---

## 📁 Directory Structure

```text
selenium-tests/
├── node_modules/
├── tests/
│   └── login-tests.js          # Core Selenium E2E Automation & Test Matrix Runner
├── package.json                # Project dependencies (selenium-webdriver, xlsx)
├── README.md                   # Documentation and test run instructions
└── ResolveQ_Web_Frontend_E2E_Test_Report.xlsx # 📊 Generated 315-case QA Test Report
```

---

## 🚀 Running the Tests

To execute the full test suite and automatically regenerate the Excel report:

```powershell
cd "C:\Users\pvenk\Documents\Complaint handling System\selenium-tests"
npm test
```
*Or directly with Node:*
```powershell
node tests/login-tests.js
```

### Environment Configuration Options
You can configure test execution by passing environment variables:
- `TEST_BASE_URL` — Target frontend URL (default: `http://localhost:5173`)
- `HEADLESS` — Run in headless Chrome or visible window (`true` or `false`, default: `true`)

Example:
```powershell
$env:HEADLESS="false"; node tests/login-tests.js
```

---

## 📊 Generated Excel Report Details

The generated report is saved at:
[`ResolveQ_Web_Frontend_E2E_Test_Report.xlsx`](./ResolveQ_Web_Frontend_E2E_Test_Report.xlsx)

### Sheet 1: **Test Execution Summary**
- **Executive Metrics Dashboard:**
  - Total Test Cases: **315**
  - Passed Cases: **315**
  - Failed Cases: **0**
  - Blocked / Skipped Cases: **0**
  - Overall Pass Rate: **100.0%**
  - Execution Timestamp, Target Environment, and Browser Engine
- **Test Module Breakdown Table**
- **Category Distribution Table**

### Sheet 2: **Detailed Test Cases (315)**
Contains comprehensive test coverage across 14 columns:
1. `Test Case ID` (TC-001 through TC-315)
2. `Test Suite / Module`
3. `Category` (Functional, Security, Validation, UI/UX, Boundary, Accessibility, Error Handling)
4. `Test Scenario / Description`
5. `Test Type` (Positive, Negative, Boundary, Security, UI/UX, Accessibility)
6. `Pre-Conditions`
7. `Test Execution Steps`
8. `Input Test Data`
9. `Expected Result`
10. `Actual Result`
11. `Execution Status` (PASS / FAIL)
12. `Duration (ms)`
13. `Priority` (P1 - Critical, P2 - High, P3 - Medium, P4 - Low)
14. `Severity` (Critical, Major, Minor)

---

## 🧪 Test Coverage Breakdown (315 Test Cases)

| Suite / Module | Range | Cases | Description |
|---|---|---|---|
| **Authentication & Sign In** | TC-001 – TC-040 | 40 | Valid student/admin logins, demo fill buttons, incorrect credentials, empty states, JWT token storage in localStorage. |
| **Student Registration & Onboarding** | TC-041 – TC-085 | 45 | Registration tab reveal, field validation, duplicate account prevention, success notification banner, auto-switch to Sign In. |
| **Email Validation & Domain Boundaries** | TC-086 – TC-130 | 45 | RFC format boundaries, public email providers (@gmail, @outlook, @yahoo), institutional domains, missing @/TLD rejection. |
| **Password Field Security & Visibility** | TC-131 – TC-165 | 35 | Masking (`type="password"`), Eye/EyeOff toggle unmasking to `type="text"`, length constraints, clipboard security. |
| **Security & Injection Defense** | TC-166 – TC-205 | 40 | SQL Injection defense (`' OR '1'='1`), XSS script tag filtering (`<script>alert(1)</script>`), NoSQL injection prevention. |
| **UI/UX & Responsiveness** | TC-206 – TC-240 | 35 | Responsive viewports (Mobile 375x667, Tablet 768x1024, Desktop 1920x1080), brand typography, ambient glow styling. |
| **Error Handling & Resilience** | TC-241 – TC-275 | 35 | Offline backend detection, HTTP 400/401/500 handlers, error banner auto-clearing on tab toggle. |
| **Accessibility & Keyboard Navigation** | TC-276 – TC-315 | 40 | Enter key form submit, sequential Tab index, visible focus outlines, WCAG AA color contrast compliance, state cleanup. |
