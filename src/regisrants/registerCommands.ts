import * as vscode from 'vscode';

const registerCommands = (context: vscode.ExtensionContext) => {
  const insertCommand = vscode.commands.registerCommand(
    'VueBreeze.insert',
    (documentPath: string) => {
      // const edition = new vscode.WorkspaceEdit();
      // edition.insert(vscode.Uri.file(documentPath), new vscode.Position(0, 0), '新插入的文字');
      const message = 'VueBreeze insert command triggered';
      console.log(message);
      vscode.window.showInformationMessage(message);
    },
  );
  context.subscriptions.push(insertCommand);
};

export default registerCommands;
