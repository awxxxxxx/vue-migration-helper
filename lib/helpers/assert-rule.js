'use strict'

function oldSchoolSpread (array) {
  return Object.prototype.toString.call(array) === '[object Array]'
    ? array
    : [].slice.call(array)
}

module.exports = function (fileData, rule) {
  var matches = fileData.line.match(rule.pattern)
  if (!matches) {
    return null;
  }
  const warning = rule.warning.apply(null, oldSchoolSpread(matches))
  warning.length = matches[0].length;
  warning.start = fileData.line.search(rule.pattern);
  return warning;
}
