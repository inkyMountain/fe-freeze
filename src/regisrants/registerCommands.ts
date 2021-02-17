import * as vscode from 'vscode';
import {Position, Range, TextEdit, WorkspaceEdit} from 'vscode';

const registerCommands = (context: vscode.ExtensionContext) => {
  const insertCommand = vscode.commands.registerCommand(
    'ZZBreeze.insert',
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
    },
  );
  context.subscriptions.push(insertCommand);
};

export default registerCommands;
