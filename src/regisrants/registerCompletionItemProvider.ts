import * as vscode from 'vscode';

interface CompletionItemProviderGenerator {
  (context: vscode.ExtensionContext): void;
}
const registerCompletionItemProvider: CompletionItemProviderGenerator = (context) => {
  const triggerCharacters = ['b'];
  const completionItem = new vscode.CompletionItem(
    'provideCompletionItems label',
    vscode.CompletionItemKind.Snippet,
  );
  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(document, position, token, context) {

      return [
        {
          label: 'breeze',
          kind: vscode.CompletionItemKind.Reference,
          detail: 'provideCompletionItems detail',
          documentation: 'provideCompletionItems documentation',
          command: {
            title: 'VueBreeze command title',
            command: 'VueBreeze.insert',
            arguments: [{documentPath: document.uri.fsPath}],
          },
        },
        {
          label: 'xxx',
          kind: vscode.CompletionItemKind.Reference,
          detail: 'provideCompletionItems detail',
          documentation: 'provideCompletionItems documentation',
          command: {
            title: 'VueBreeze command title',
            command: 'VueBreeze.insert',
            arguments: [{documentPath: document.uri.fsPath}],
          },
        },
      ];
    },
  };
  // const disposable1 = vscode.languages.registerCompletionItemProvider(
  //   'typescript',
  //   provider,
  //   ...triggerCharacters,
  // );
  // const disposable2 = vscode.languages.registerCompletionItemProvider(
  //   'vue',
  //   provider,
  //   ...triggerCharacters,
  // );
  // context.subscriptions.push(disposable1, disposable2);
};

export default registerCompletionItemProvider;
