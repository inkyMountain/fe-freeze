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
import {positionAfterScriptStart} from './utils/positionSeekers';
import {LanguageMode} from './modes/LanguageMode';
import ScriptMode from './modes/ScriptMode';
import TemplateMode from './modes/TemplateMode';
import {triggerCharacters, eol, NULL_COMPLETION_LIST} from './variables';
import DocumentService from './services/documentService';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {parse as parseVueToAst, parseForESLint, AST} from 'vue-eslint-parser';

class BreezeLsp {
  constructor() {}

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
    this.modes = {
      script: new ScriptMode(this.documentService),
      template: new TemplateMode(this.documentService),
    };
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
    const document = this.documentService.getDocument(textDocument.uri);
    let ast: AST.ESLintProgram;
    try {
      ast = parseVueToAst(document.getText(), {sourceType: 'module', parser: '@typescript-eslint/parser'});
    } catch (e) {
      // If ast parsing failed, return an empty completion list.
      console.log('e', e);
      return NULL_COMPLETION_LIST;
    }


    const offset = document.offsetAt(position);

    // Caculate proper completion list while user typing in **script** tag.
    const isInScriptArea = ast.range[1] >= offset && ast.range[0] <= offset;
    if (isInScriptArea) {
      const token = ast.tokens.find(({range: [start, end]}) => {
        return start <= offset && end >= offset;
      });
      return this.modes.script.onCompletion({
        document,
        position,
        token: token.value,
        ast
      });
    }

    // Caculate proper completion list while user typing in **template** tag.
    const isInTemplateArea = ast.templateBody.range[1] >= offset && ast.templateBody.range[0] <= offset;
    if (isInTemplateArea) {
      const token = ast.templateBody.tokens.find(({range: [start, end]}) => {
        return start <= offset && end >= offset;
      });
      return this.modes.template.onCompletion({
        document,
        position,
        token: token.value,
        ast
      });
    }

    return NULL_COMPLETION_LIST;
  };

  onCompletionResolve = async (item: CompletionItem): Promise<CompletionItem> => {
    const {mode} = item.data;
    return this.modes[mode].onCompletionResolve(item) ?? item;
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
