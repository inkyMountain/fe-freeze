import * as path from 'path';
import {workspace, ExtensionContext, window} from 'vscode';
import * as vscode from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient';
import registerCompletionItemProvider from './regisrants/registerCompletionItemProvider';
import registerCommands from './regisrants/registerCommands';

let client: LanguageClient;
const isProduction = process.env.NODE_ENV === 'production';

export function activate(context: ExtensionContext) {
  registerCompletionItemProvider(context);
  registerCommands(context);
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(path.join('out', 'server.js'));
  // The debug options for the server
  const debugOptions = {execArgv: ['--nolazy', '--inspect=6013']};

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: {module: serverModule, transport: TransportKind.ipc},
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [
      {language: 'vue'},
      {language: 'javascript'},
      {language: 'typescript'},
    ],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/.clientrc'),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient('VueBreeze', 'Vue Breeze', serverOptions, clientOptions);
  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
