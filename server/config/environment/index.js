'use strict';

var _ = require('lodash');

process.env.AURA_NODE_ENV = process.env.AURA_NODE_ENV || 'production';
// All configurations will extend these options
// ============================================
var all = {
  env: process.env.AURA_NODE_ENV ,
  host: process.env.AURA_IP || 'localhost',
  appName: 'aura-workout',
  routes: {
    prefix: '/v1/aura-workout'
  },
  salt: 'aura-workouts4ltv4lu3',
  zingCredentials: {
    username: 'wtop',
    password: 'aura90048'
  },
  zingUrl: 'https://reserve.auraworkout.com/admin/index.cfm',
  zingRegisterUrl: 'https://reserve.auraworkout.com/reserve/index.cfm',

  zingConfigurations: {
    attendance: {
      rooms: [1, 3, 4, 5]
    }
  },

  dataTables: {
    mailRules: 'Rules',
    freeClasses: 'FreeClass',
    customers: 'Customer'
  },
};



console.log('Runing in ', process.env.AURA_NODE_ENV, 'mode');

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.AURA_NODE_ENV) || {});
