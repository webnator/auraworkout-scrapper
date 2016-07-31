'use strict';

// Development specific configuration
// ==================================
module.exports = {
  ip              : 'localhost',
  port            : 9000,

  // mysqlSettings: {
  //   host     : '127.0.0.1',
  //   port     : '3306',
  //   user     : 'root',
  //   password : '',
  //   database : 'aura-workout-reports'
  // },

  /*

   user     : 'root',
   password : 'mX9yv4sW5!*',
   */

  mysqlSettings: {
    host     : '52.37.165.21',
    port     : '3306',
    user     : 'toptalAPI',
    password : 'QbX!4{82KOx*',
    database : 'zing_reports'
  },

  mandrill: {
    apiKey: 'hJ-hBo2epIsbRJK5SmbRWg'
  },

  email: {
    subject: 'Thanks for joining Aura',
    from_email: 'customers@aurapulse.com',
    from_name: 'Customer department',
  },
  
  mongoSettings: {
    port: '27000',
    username: '',
    password: ''
  }
};
