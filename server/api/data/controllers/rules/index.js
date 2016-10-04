'use strict';

var Utils = require('../../../components/utils');
var log = Utils.log;

class Rule {
  constructor (data, rule) {
    this.rule = rule;
    this.data = data;
    this.actionName = rule.action;
  }

  execute() {
    log('info', '', 'rule Accessing ' + this.actionName);
    var ruleAction = require('./' + this.actionName);
    return ruleAction(this.data, this.rule);
  }

}
module.exports = Rule;