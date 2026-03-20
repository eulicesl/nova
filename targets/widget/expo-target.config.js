/* eslint-env node */
/* global module */
/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = () => ({
  type: 'widget',
  icon: '../../assets/images/logo-dark.png',
  entitlements: {
    'com.apple.security.application-groups': ['group.com.eulices.nova']
  },
  frameworks: ['SwiftUI', 'ActivityKit']
});
