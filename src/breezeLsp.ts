import {
  Connection,
  TextDocumentPositionParams,
  CompletionItemKind,
  ConnectionError,
  InsertTextFormat,
  TextEdit,
  InsertTextMode,
  CompletionItem,
  createConnection,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  TextDocumentSyncKind,
  InitializeResult,
  DidChangeWatchedFilesParams,
  DidChangeConfigurationParams,
} from 'vscode-languageserver';
import {afterScriptStart as positionAfterScriptStart} from './utils/positionSeekers';
import {LanguageMode, OnCompletion, OnCompletionResolve} from './modes/LanguageMode';
import ScriptMode from './modes/ScriptMode';
import TemplateMode from './modes/TemplateMode';
import {triggerCharacters, eol} from './variables';
import DocumentService from './services/documentService';
import {TextDocument} from 'vscode-languageserver-textdocument';

class BreezeLsp {
  constructor() {
    this.modes = {
      script: new ScriptMode(),
      template: new TemplateMode(),
    };
  }

  modes: {[key: string]: LanguageMode} = {};

  connection: Connection;
  documentService: DocumentService;

  capabilities = {
    configuration: false,
    workspaceFolders: false,
    diagnoseRelateInfo: false,
  };

  async initServer() {
    this.connection = createConnection(ProposedFeatures.all);
    this.documentService = new DocumentService(this.connection);
    this.setupLspHanlders(this.connection);
    this.connection.onInitialize(this.onInitialize);
    this.connection.onInitialized(this.onInitialized);
    this.connection.onDidChangeWatchedFiles(this.onDidChangeWatchedFiles);
    this.connection.onDidChangeConfiguration = (change) => {};
    this.connection.listen();
  }

  setupLspHanlders = (connection: Connection) => {
    connection.onCompletion(this.onCompletion);
    connection.onCompletionResolve(this.onCompletionResolve);
  };

  onCompletion = (textDocumentPosition: TextDocumentPositionParams) => {
    const {textDocument, position} = textDocumentPosition;
    const insertCommandParam = {uri: textDocument.uri, position};
    return [
      {
        label: 'skipToUrl',
        kind: CompletionItemKind.Reference,
        detail: 'provideCompletionItems detail',
        documentation: 'provideCompletionItems documentation',
        insertTextFormat: InsertTextFormat.Snippet,
        command: {
          title: 'VueBreeze command title',
          command: 'VueBreeze.insert',
          arguments: [{...insertCommandParam, label: 'xxx'}],
        },
        data: {
          position,
          uri: textDocument.uri,
        },
      },
    ];
  };

  onCompletionResolve = (item: CompletionItem): CompletionItem => {
    const {position, uri} = item.data;
    const document = this.documentService.getDocument(uri);

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
  };

  onInitialize = (params: InitializeParams) => {
    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    this.capabilities = {
      configuration: !!capabilities.workspace?.configuration,
      workspaceFolders: !!capabilities.workspace?.workspaceFolders,
      diagnoseRelateInfo: !!capabilities.textDocument?.publishDiagnostics?.relatedInformation,
    };

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
    if (this.capabilities.workspaceFolders) {
      result.capabilities.workspace = {
        workspaceFolders: {
          supported: true,
        },
      };
    }
    return result;
  };

  onInitialized = () => {
    const connection = this.connection;
    connection.window.showInformationMessage('Vue Breeze successfullly initialized');
    if (this.capabilities.configuration) {
      // Register for all configuration changes.
      this.connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (this.capabilities.workspaceFolders) {
      connection.workspace.onDidChangeWorkspaceFolders((event) => {
        connection.console.log('Workspace folder change event received.');
      });
    }
  };

  onDidChangeWatchedFiles = (change: DidChangeWatchedFilesParams) => {
    // Monitored files have change in VSCode
    console.log('We received an file change event');
  };

  onDidChangeConfiguration = (change: DidChangeConfigurationParams) => {
    if (this.capabilities.configuration) {
    }
  };
}

export default BreezeLsp;
