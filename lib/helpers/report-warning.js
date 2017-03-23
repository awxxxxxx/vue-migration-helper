'use babel';

const chalk = require('chalk')
const migrationGuideUrlFor = require('./migration-guide-url-for')
const parentFolderNameFor = require('./parent-folder-name-for')

let warningCount = 0
module.exports = function (fileData, warning, rule) {
  warningCount++;

  var library = parentFolderNameFor(rule.file);

  console.log()
  console.log(chalk.yellow(
    warningCount + '. ' + warning.fix
  ))
  console.log(chalk.blue('  Line ' + fileData.lineNum + ': ' + fileData.file))
  console.log(chalk.cyan.dim('  Reason: ' + warning.reason))
  console.log(chalk.cyan.dim(
    '  More info: ' +
    chalk.underline(migrationGuideUrlFor(library) + '#' + warning.docsHash)
  ));
  warning.line = fileData.lineNum;
  warning.info = migrationGuideUrlFor(library) + '#' + warning.docsHash;
  return warning;
}
