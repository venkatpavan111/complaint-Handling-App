/**
 * Appium 2.x & UiAutomator2 Server Configuration
 */
module.exports = {
  server: {
    address: '127.0.0.1',
    port: 4723,
    relaxedSecurity: true,
    allowInsecure: ['chromedriver_autodownload']
  },
  androidCapabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:appPackage': 'host.exp.exponent',
    'appium:appActivity': 'host.exp.exponent.experience.HomeActivity',
    'appium:noReset': true,
    'appium:newCommandTimeout': 180,
    'appium:autoGrantPermissions': true
  },
  iosCapabilities: {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': 'iPhone 15',
    'appium:bundleId': 'host.exp.Exponent',
    'appium:noReset': true
  }
};
