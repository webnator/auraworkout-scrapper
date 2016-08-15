'use strict';

// Development specific configuration
// ==================================
module.exports = {
  ip              : 'localhost',
  port            : 9000,

  mysqlSettings: {
    host     : '127.0.0.1',
    port     : '3306',
    user     : 'root',
    password : '',
    database : 'aura-workout-reports'
  },

  /*

   user     : 'root',
   password : 'mX9yv4sW5!*',
   */

  // mysqlSettings: {
  //   host     : '52.37.165.21',
  //   port     : '3306',
  //   user     : 'toptalAPI',
  //   password : 'QbX!4{82KOx*',
  //   database : 'zing_reports'
  // },

  dataTables: {
    mailRules: 'Mail_queries'
  },

  mailChimp: {
    url: 'https://us13.api.mailchimp.com/3.0',
    contact: {
      company: 'Aura',
      address1: 'CA',
      city: 'LA',
      state: 'CA',
      zip: '28034',
      country: 'USA'
    },
    apiKey: '00aee962503e2bd1bea327ea27a28b51-us13'
  },

  mandrill: {
    apiKey: 'hJ-hBo2epIsbRJK5SmbRWg',
    defaultConfig: {
      template: 'Registration- 1w Aura Yoga',
      subject: 'Thanks for joining Aura',
      from_email: 'aura@aurapulse.com',
      from_name: 'Aura'
    }
  },
  
  mongoSettings: {
    port: '27000',
    username: '',
    password: ''
  }
};
