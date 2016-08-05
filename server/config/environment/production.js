'use strict';

// Production specific configuration
// =================================
module.exports = {
  ip              : 'localhost',
  port            : process.env.PORT || 9000,

  // mysqlSettings: {
  //   host     : '107.180.21.19',
  //   port     : '3306',
  //   user     : 'toptalAdmin',
  //   password : 'QbX!4{82KOx*',
  //   database : 'zing_reports'
  // },

  mysqlSettings: {
    host     : '52.37.165.21',
    port     : '3306',
    user     : 'toptalAPI',
    password : 'QbX!4{82KOx*',
    database : 'zing_reports'
  },

  mandrill: {
    apiKey: 'hJ-hBo2epIsbRJK5SmbRWg',
    defaultConfig: {
      template: 'Registration- 1w Aura Yoga',
      subject: 'Thanks for joining Aura',
      from_email: 'aura@aurapulse.com',
      from_name: 'Aura'
    },
    templates: {
      'startnow': {
        template: 'Registration- 1w Aura Yoga',
        subject: 'Thanks for joining AuraYoga',
        from_email: 'aura@aurayoga.com',
        from_name: 'AuraYoga'
      },
      'tryaura': {
        template: 'Registration- 1c AuraCycle',
        subject: 'Thanks for joining AuraCycle',
        from_email: 'aura@auracycle.com',
        from_name: 'AuraCycle'
      }
    }
  },

  mongoSettings: {
  port: '',
    username: 'root',
    password: 'AC1kuG1RVoWH'
  }
};
