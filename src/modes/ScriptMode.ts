import type {
  LanguageMode,
  OnCompletion,
  OnCompletionResolve,
} from './languageMode';
import {NULL_COMPLETION_LIST, eol} from '../variables';
import {
  CompletionItem,
  CompletionList,
  CompletionItemKind,
  InsertTextFormat,
  Position,
  TextEdit,
  InsertTextMode,
} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import adapterLibraryProvider from '../libraryProvider/adapter';
import DocumentService from 'src/services/documentService';
import {positionAfterScriptStart} from '../utils/positionSeekers';
import {AST} from 'vue-eslint-parser';

class ScriptMode implements LanguageMode {
  documentService: DocumentService;

  constructor(documentService: DocumentService) {
    this.documentService = documentService;
  }

  currentDocumentAst: AST.ESLintProgram;

  onCompletion: OnCompletion = ({document, position, token, ast}) => {
    const methods = (adapterLibraryProvider.methods ?? []) as Array<Method>;
    this.currentDocumentAst = ast;
    const completionItems = methods
      .filter((method) => method.label.startsWith(token))
      .map((method) => {
        return {
          label: method.label,
          kind: CompletionItemKind.Unit,
          detail: method.detail,
          documentation: method.documentation,
          insertTextFormat: InsertTextFormat.Snippet,
          data: {
            position,
            uri: document.uri,
            mode: 'script',
            sortText: 'a',
            packageName: adapterLibraryProvider.packageName,
            method,
            defaultImportVariableName:
              adapterLibraryProvider.defaultImportVariableName,
          },
        };
      });
    return {
      isIncomplete: false,
      items: completionItems,
    };
  };

  onCompletionResolve: OnCompletionResolve = async (item: CompletionItem) => {
    const {
      position,
      uri,
      method,
      packageName,
      defaultImportVariableName,
    } = item.data;
    const document = this.documentService.getDocument(uri);
    if (!document) {
      return item;
    }

    const text = document.getText();
    const isNativeAlreadyImported =
      (text.match(
        new RegExp(`import ${defaultImportVariableName} from '${packageName}'`),
      )?.length ?? 0) >= 1;
    item.insertText = method.snippet.join(eol);
    item.insertTextFormat = InsertTextFormat.Snippet;
    item.additionalTextEdits = item.additionalTextEdits ?? [];
    const textEditPosition = positionAfterScriptStart(document);
    if (textEditPosition) {
      // TextEdit.insert generates a TextEdit object,
      // client receive the object and do insert action according to it.
      const edits = [];
      if (!isNativeAlreadyImported) {
        edits.push(
          TextEdit.insert(
            textEditPosition,
            `import ${defaultImportVariableName} from '${packageName}';${eol}`,
          ),
        );
      }
      item.additionalTextEdits.push(...edits);
    }
    item.insertTextMode = InsertTextMode.adjustIndentation;
    this.createVueUseTextEdit(this.currentDocumentAst);
    return item;
  };

  createVueUseTextEdit = (
    node: AST.Node,
  ): Promise<null | TextEdit> => {
    /**
     * TODO: Find the root "Vue" node, and search its ancestors to see 
     * if it contains the target zzui component 
     * See note in Typora for detail
     */
    AST.traverseNodes(node, {
      enterNode(n, parent) {
        console.log('n', n);
      },
      leaveNode(n, parent) {

      }
    });
    return null;
  };
}
export default ScriptMode;
