import * as vscode from 'vscode';
import {Position, Range, TextEdit, WorkspaceEdit} from 'vscode';

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
      const edition = new WorkspaceEdit();
      
      const fileUri = vscode.Uri.file(documentPath);
      // Delete the selected label and then insert new content related to the label.
      // edition.delete(
      //   fileUri,
      //   new Range(
      //     new Position(position.line, position.character - 1),
      //     new Position(position.line, position.character + label.length),
      //   ),
      // );

      // edition.insert(
      //   fileUri,
      //   new Position(position.line, position.character + label.length),
      //   'const xxx: string = "xxx"',
      // );
      // edition.insert(vscode.Uri.file(filePath), new vscode.Position(1, 0), '新内容' + (new Date()).getMinutes());
      // vscode.workspace
      //   .applyEdit(edition)
      //   .then((res) => {
      //     return vscode.window.showInformationMessage(
      //       'insertion success',
      //       '选项1',
      //       '选项2',
      //       '选项3',
      //     );
      //   })
      //   .then(
      //     (...args) => {
      //       console.log('args', args);
      //     },
      //     (e) => {
      //       console.log('e', e);
      //     },
      //   );
    },
  );
  context.subscriptions.push(insertCommand);
};

export default registerCommands;
