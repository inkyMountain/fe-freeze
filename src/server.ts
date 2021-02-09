import {triggerCharacters, eol} from './variables';
import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  WorkspaceEdit,
  TextEdit,
  InsertTextMode,
  InsertTextFormat,
} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {promises as fs} from 'fs';
import * as path from 'path';
import {afterScriptStart as positionAfterScriptStart} from './utils/positionSeekers';
import {parse} from './parser/htmlParser';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
  console.log('onInitialize');
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!capabilities.workspace?.configuration;
  hasWorkspaceFolderCapability = !!capabilities.workspace?.workspaceFolders;
  hasDiagnosticRelatedInformationCapability = !!capabilities.textDocument?.publishDiagnostics?.relatedInformation;

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
        // By default, "onComplete" event is only triggered when an identifier is being typed after a blank space.
        // If triggerCharacters is given, "onComplete" event will be triggered after these characters besides blank space.
        // e.g. "fs.readFile" "fs*readFile"(with "*" specified in "triggerCharacters" option).
        triggerCharacters,
      },
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

connection.onInitialized(() => {
  connection.window.showInformationMessage('Vue Breeze successfullly initialized');
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});
// This is the type defination of Vue Breeze plugin's setting,
// depending on items listed in field contributes.configuration of package.json.
// Do sync this type with the change of contributes.configuration field.
interface VueBreezeSettings {
  maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: VueBreezeSettings = {maxNumberOfProblems: 1000};
let globalSettings: VueBreezeSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<VueBreezeSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <VueBreezeSettings>(change.settings.VueBreeze || defaultSettings);
  }

  // Revalidate all open text documents
  // documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<VueBreezeSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'VueBreeze',
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose((e) => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  // validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // In this simple example we get the settings for every validate run.
  const settings = (await getDocumentSettings(textDocument.uri)) || globalSettings;
  // The validator creates diagnostics for all uppercase words length 2 and more
  let text = textDocument.getText();
  let pattern = /\b[A-Z]{2,}\b/g;
  let m: RegExpExecArray | null;

  let problems = 0;
  let diagnostics: Diagnostic[] = [];
  while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
    problems++;
    let diagnostic: Diagnostic = {
      severity: DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
      },
      message: `${m[0]} is all uppercase.`,
      source: 'ex',
    };
    if (hasDiagnosticRelatedInformationCapability) {
      diagnostic.relatedInformation = [
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range),
          },
          message: 'Spelling matters',
        },
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range),
          },
          message: 'Particularly for names',
        },
      ];
    }
    diagnostics.push(diagnostic);
  }

  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({uri: textDocument.uri, diagnostics});
}

connection.onDidChangeWatchedFiles((_change) => {
  // Monitored files have change in VSCode
  connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion((_textDocumentPosition: TextDocumentPositionParams, ...args) => {
  // The pass parameter contains the position of the text document in
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  // console.log('_textDocumentPosition', _textDocumentPosition);
  const {
    textDocument,
    position,
  } = _textDocumentPosition;
  const insertCommandParam = {uri: textDocument.uri, position};
  // TODO: Offer different compelitions according to node type, like <template> <script> or <style>
  return [
    {
      label: 'skipToUrl',
      kind: CompletionItemKind.Reference,
      detail: 'provideCompletionItems detail',
      documentation: 'provideCompletionItems documentation',
      insertTextFormat: 2,
      command: {
        title: 'VueBreeze command title',
        command: 'VueBreeze.insert',
        arguments: [{...insertCommandParam, label: 'xxx'}],
      },
      data: {
        uri: textDocument.uri,
        position,
      },
    },
  ];
});

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    const {uri, position} = item.data;
    const document = documents.all().find((doc) => doc.uri === uri);
    const offset = document?.offsetAt(position);
    const htmlDocument = parse(document!.getText());
    const node = htmlDocument.findNodeBefore(offset!);
    console.log('node', node);
    if (!document) {
      return item;
    }

    const text = document.getText();
    const isNativeAlreadyImported = (text.match(/import native from '@zz-common\/native-adapter'/)?.length ?? 0) >= 1;
    item.insertText = `native.skipToUrl({
  targetUrl: '\${1:https://m.zhuanzhuan.com}',
  needClose: \${2| '0', '1' |}
})
$0`;
    item.insertTextFormat = InsertTextFormat.Snippet;
    item.additionalTextEdits = item.additionalTextEdits ?? [];
    const textEditPosition = positionAfterScriptStart(document);
    if (textEditPosition) {
      // TextEdit.insert generate a TextEdit object,
      // client receive the object and do insert action according to it.
      const edits = [];
      if (!isNativeAlreadyImported) {
        edits.push(TextEdit.insert(textEditPosition, `import native from '@zz-common/native-adapter';${eol}`));
      }
      item.additionalTextEdits.push(...edits);
    }
    item.insertTextMode = InsertTextMode.adjustIndentation;
    return item;
  },
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
