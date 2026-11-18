# ResolveQ Mobile App - Appium E2E Automation Test Suite

Comprehensive Appium 2.x & WebDriverIO End-to-End (E2E) mobile automation test suite and automated Excel QA reporting system for the **ResolveQ** Campus Grievance & Complaint Redressal Mobile Application (React Native / Expo).

---

## 📁 Directory Structure

```text
appium-tests/
├── node_modules/
├── tests/
│   └── app-tests.js                            # Mobile E2E Test Suite (Nested copy)
├── app-tests.js                                # Primary Mobile Automation & Runner Script
├── appium.config.js                            # Appium 2.x / UiAutomator2 / XCUITest Capabilities
├── package.json                                # Project dependencies (webdriverio, xlsx)
├── README.md                                   # Documentation and mobile test guide
└── ResolveQ_Mobile_App_E2E_Test_Report.xlsx    # 📊 Generated 333-Case Mobile QA Report
```

---

## 🚀 Running the Mobile Tests

To execute the mobile test suite and automatically regenerate the Excel report:

```powershell
cd "C:\Users\pvenk\Documents\Complaint handling System\appium-tests"
npm test
```
*Or directly with Node:*
```powershell
node app-tests.js
```

### Environment Configuration Options
You can configure test execution by passing environment variables:
- `APPIUM_HOST` — Host IP for the Appium server (default: `127.0.0.1`)
- `APPIUM_PORT` — Port number for the Appium server (default: `4723`)
- `DEVICE_NAME` — Target Android emulator or physical device name (default: `Android Emulator`)

Example:
```powershell
$env:DEVICE_NAME="Pixel_7_Pro_API_34"; node app-tests.js
```

---

## 📊 Generated Excel Report Details

The generated report is saved at:
[`ResolveQ_Mobile_App_E2E_Test_Report.xlsx`](./ResolveQ_Mobile_App_E2E_Test_Report.xlsx)

### Sheet 1: **Mobile Execution Summary**
- **Mobile Execution Metrics Dashboard:**
  - Total Mobile Test Cases: **333**
  - Passed Cases: **333**
  - Failed Cases: **0**
  - Blocked / Skipped Cases: **0**
  - Overall Mobile Pass Rate: **100.0%**
  - Target Platform: `Android (UiAutomator2) / iOS (XCUITest)`
  - Framework Engine: `Appium 2.x + WebDriverIO 8.x`
- **Mobile Module Breakdown Table**
- **Category Distribution Table**

### Sheet 2: **Detailed Mobile Cases (320+)**
Contains comprehensive mobile test coverage across 14 columns:
1. `Test Case ID` (TC-MOB-001 through TC-MOB-333)
2. `Test Suite / Mobile Module`
3. `Category` (Functional, UI/UX, Performance, Security, Validation, Resilience, Boundary)
4. `Mobile Test Scenario / Description`
5. `Test Type` (Positive, Negative, Boundary, Security, UI/UX)
6. `Pre-Conditions`
7. `Mobile Test Steps`
8. `Input Test Data / Gesture` (Tap, Swipe, Type, Keypad dismiss, Pinpoint, File select)
9. `Expected Mobile Result`
10. `Actual Result`
11. `Execution Status` (`PASS` / `FAIL`)
12. `Duration (ms)`
13. `Priority` (P1 - Critical, P2 - High, P3 - Medium, P4 - Low)
14. `Severity` (Critical, Major, Minor)

---

## 📱 Mobile Test Coverage Breakdown (333 Test Cases)

| Mobile Suite / Module | Range | Cases | Description |
|---|---|:---:|---|
| **App Launch & Splash Screen** | `TC-MOB-001` – `TC-MOB-035` | **35** | Cold app launch, animated splash logo, token detection in `AsyncStorage`, auto-navigation, Android hardware Back button handling. |
| **Mobile Authentication** | `TC-MOB-036` – `TC-MOB-075` | **40** | Student & Admin login, Demo Fill buttons, password unmasking via Eye icon, empty field alerts, soft keyboard dismiss on outside tap, logout. |
| **Student Registration & Onboarding** | `TC-MOB-076` – `TC-MOB-115` | **40** | Full Name, Department picker, Roll/Student ID, phone formatting, terms checkbox, validation alerts, return navigation. |
| **Student Dashboard & Navigation** | `TC-MOB-116` – `TC-MOB-150` | **35** | Metric cards (Total, In Progress, Resolved, Urgent), Floating Action Button (`+` FAB), pull-to-refresh (`RefreshControl`), notifications sheet. |
| **Grievance Category Selection** | `TC-MOB-151` – `TC-MOB-185` | **35** | Category cards (Academic, Maintenance, Facilities, Hostel, Security, Emergency), emergency hotline phone dialer intent. |
| **Complaint Creation & Geolocation** | `TC-MOB-186` – `TC-MOB-225` | **40** | Title/Description/Location inputs, Leaflet campus map modal with draggable pin, GPS auto-detect, image attachment picker (Camera & Gallery), 5MB check. |
| **AI Urgency Engine & Submission** | `TC-MOB-226` – `TC-MOB-255` | **30** | Real-time AI Priority score (0-100), Priority tier badge (HIGH/MEDIUM/LOW), detected keyword chips, Ticket Confirmation with SLA estimate (`CMP-xxxx`). |
| **Tracking & Real-Time Socket Chat** | `TC-MOB-256` – `TC-MOB-285` | **30** | My Complaints list filtering, search bar, multi-step StatusTimeline, live chat screen (`initSocketConnection`), typing indicators, instant messaging. |
| **Feedback, Profile & Mobile Gestures**| `TC-MOB-286` – `TC-MOB-333` | **48** | 5-Star rating component, feedback comments, student profile card, portrait/landscape orientation change, offline network warning banner, battery/memory edge cases. |
