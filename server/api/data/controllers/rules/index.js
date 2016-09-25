'use strict';

class Rule {
  constructor (data, rule) {
    this.rule = rule;
    this.data = data;
    this.actionName = rule.action;
  }

  execute() {
    var ruleAction = require('./' + this.actionName);
    return ruleAction(this.data, this.rule);
  }

}
module.exports = Rule;