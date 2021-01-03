import * as vscode from 'vscode';
import {Position, Range, TextEdit} from 'vscode';

const registerCommands = (context: vscode.ExtensionContext) => {
  const insertCommand = vscode.commands.registerCommand(
    'VueBreeze.insert',
    ({
      uri: documentPath,
      position,
      label,
    }: {
      uri: string;
      position: vscode.Position;
      label: string;
    }) => {
      const documentPathWithoutFileProtocal = documentPath.replace(/^(file:\/\/\/?)/, '/');
      const edition = new vscode.WorkspaceEdit();

      edition.insert(
        vscode.Uri.file(documentPathWithoutFileProtocal),
        new Position(position.line, position.character + label.length),
        'const xxx: string = "xxx"',
      );
      // edition.insert(vscode.Uri.file(filePath), new vscode.Position(1, 0), '新内容' + (new Date()).getMinutes());
      vscode.workspace.applyEdit(edition).then(
        (res) => {
          vscode.window.showInformationMessage('insert success');
        },
        (e) => {
          console.log('e', e);
        },
      );
    },
  );
  context.subscriptions.push(insertCommand);
};

export default registerCommands;
