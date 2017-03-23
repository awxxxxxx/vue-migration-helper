'use babel';

import VueMigrationHelpView from './vue-migration-help-view';
import { CompositeDisposable } from 'atom';
import checkForDeprecations from './helpers/check-for-deprecations';

export default {

  vueMigrationHelpView: null,
  subscriptions: null,

  activate(state) {
    this.vueMigrationHelpView = new VueMigrationHelpView(state.vueMigrationHelpViewState);
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
  },

  deactivate() {
    this.subscriptions.dispose();
    this.vueMigrationHelpView.destroy();
  },

  serialize() {
    return {
      vueMigrationHelpViewState: this.vueMigrationHelpView.serialize()
    };
  },

  checkForDeprecations(editor) {
    const buffer = editor.getBuffer();
    const file = editor.getTitle();
    const reports = []
    buffer.getLines().forEach((line, index) => {
      const report = checkForDeprecations({
        line: line,
        lineNum: index + 1,
        file: file,
      });
      if (report) {
        reports.push(report);
      }
    });
    return reports;
  },

  genMessages(reports, filePath) {
    return reports.map((rp) => {
      return {
        severity: 'warning',
        location: {
          file: filePath,
          position: [[rp.line - 1, rp.start], [rp.line - 1, rp.start + rp.length]],
        },
        url: rp.info,
        excerpt: rp.fix,
        description: rp.reason,
      }
    });
  },
  lint(editor, linter) {
    const editorPath = editor.getPath();
    if (!editorPath) {
      return;
    }
    if (!editorPath.indexOf('.js') && !editorPath.indexOf('.vue') && !editorPath.indexOf('package.json')) {
      return false;
    }
    const reports = this.checkForDeprecations(editor);
    const messages = this.genMessages(reports, editorPath);
    linter.setMessages(editorPath, messages);
  },

  consumeIndie(registerIndie) {
    const linter = registerIndie({
      name: 'vue-migration-help',
    });
    this.subscriptions.add(linter);
    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      this.lint(editor, linter);

      const saveSubscription = editor.onDidSave(() => {
        this.lint(editor, linter);
      });

      const subscription = editor.onDidDestroy(() => {
        this.subscriptions.remove(subscription);
        linter.setMessages(editor.getPath(), []);
      });
      this.subscriptions.add(subscription);
    }));
  }
};
