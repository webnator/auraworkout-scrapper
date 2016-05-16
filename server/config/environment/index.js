'use strict';

var _ = require('lodash');

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.AURA_NODE_ENV,
  host: process.env.AURA_IP || 'localhost',
  appName: 'aura-workout',
  routes: {
    prefix: '/v1/aura-workout'
  },
  salt: 'aura-workouts4ltv4lu3',
  zingCredentials: {
    username: 'Williams',
    password: 'greensky70'
  },
  zingUrl: 'http://reserve.auraworkout.com/admin/index.cfm'
};

console.log('Runing in ', process.env.AURA_NODE_ENV, 'mode');

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.AURA_NODE_ENV) || {});
