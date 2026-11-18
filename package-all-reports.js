/**
 * Utility script to consolidate all 4 Excel QA reports into a single folder
 * for easy artifact archiving in GitHub Actions.
 */
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, 'all-excel-reports');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const reports = [
  {
    src: path.resolve(__dirname, 'selenium-tests', 'ResolveQ_Web_Frontend_E2E_Test_Report.xlsx'),
    dest: path.resolve(targetDir, '1_Web_Frontend_Selenium_E2E_Report.xlsx'),
    name: 'Selenium Web E2E Test Report (315 Tests)'
  },
  {
    src: path.resolve(__dirname, 'appium-tests', 'ResolveQ_Mobile_App_E2E_Test_Report.xlsx'),
    dest: path.resolve(targetDir, '2_Mobile_App_Appium_E2E_Report.xlsx'),
    name: 'Appium Mobile App E2E Test Report (333 Tests)'
  },
  {
    src: path.resolve(__dirname, 'Vulnerability Test Results', 'findings.xlsx'),
    dest: path.resolve(targetDir, '3_Security_Vulnerabilities_Report.xlsx'),
    name: 'Comprehensive Security Findings Report (4 Sheets, 15 Vulnerabilities)'
  },
  {
    src: path.resolve(__dirname, 'Vulnerability Test Results', 'endpoint-inventory.xlsx'),
    dest: path.resolve(targetDir, '4_API_Endpoint_Inventory_Report.xlsx'),
    name: 'API Endpoint Inventory Report (20 Endpoints)'
  }
];

console.log('===============================================================');
console.log('📦 CONSOLIDATING ALL 4 EXCEL TEST REPORTS');
console.log('===============================================================');

let copiedCount = 0;
reports.forEach((rep, index) => {
  if (fs.existsSync(rep.src)) {
    fs.copyFileSync(rep.src, rep.dest);
    const stats = fs.statSync(rep.dest);
    console.log(`✅ [${index + 1}/4] Copied: ${rep.name}`);
    console.log(`     Source: ${rep.src}`);
    console.log(`     Target: ${rep.dest} (${(stats.size / 1024).toFixed(1)} KB)`);
    copiedCount++;
  } else {
    console.warn(`⚠️ [${index + 1}/4] Source report not found: ${rep.src}`);
  }
});

console.log('---------------------------------------------------------------');
console.log(`Total Excel Reports Packaged: ${copiedCount} / 4`);
console.log(`Output Directory: ${targetDir}`);
console.log('===============================================================\n');

if (copiedCount < 4) {
  process.exitCode = 1;
}
