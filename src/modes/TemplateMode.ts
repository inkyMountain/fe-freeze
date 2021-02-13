import {NULL_COMPLETION_LIST, eol, triggerCharacters} from '../variables';
import {
  CompletionItem,
  CompletionList,
  CompletionItemKind,
  InsertTextFormat,
  InsertTextMode,
} from 'vscode-languageserver-types';
import {TextEdit} from 'vscode-languageserver';
import type {
  LanguageMode,
  OnCompletion,
  OnCompletionResolve,
} from './languageMode';
import DocumentService from 'src/services/documentService';
import zzuiLibraryProvider from '../libraryProvider/zzui';
import {positionAfterScriptStart} from '../utils/positionSeekers';

class TemplateMode implements LanguageMode {
  documentService: DocumentService;
  constructor(documentService: DocumentService) {
    this.documentService = documentService;
  }

  onCompletion: OnCompletion = ({ast, position, token, document}) => {
    const components = zzuiLibraryProvider.components.filter((component) =>
      component.label.startsWith(token),
    );
    const completionItems: Array<CompletionItem> = components.map((component) => {
      return {
        label: component.label,
        kind: CompletionItemKind.Unit,
        detail: component.detail,
        documentation: component.documentation,
        insertTextFormat: InsertTextFormat.Snippet,
        // Use letter 'a' as sortText to make sure that
        // items provided in this plugin takes the highest priority.
        sortText: 'a',
        data: {
          position,
          uri: document.uri,
          mode: 'template',
          packageName: zzuiLibraryProvider.packageName,
          component,
          ast
        },
      };
    });
    return {
      isIncomplete: false,
      items: completionItems,
    };
  };

  onCompletionResolve: OnCompletionResolve = async (item: CompletionItem) => {
    const {position, uri, packageName, component, ast} = item.data;
    const document = this.documentService.getDocument(uri);

    if (!document) {
      return item;
    }

    const text = document.getText();
    const isNativeAlreadyImported =
      (text.match(
        new RegExp(`import {${component.name}} from '${packageName}'`),
      )?.length ?? 0) >= 1;
    item.insertText = component.snippet.join(eol);
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
            `import {${component.name}} from '${packageName}';${eol}`,
          ),
        );
      }
      item.additionalTextEdits.push(...edits);
    }
    item.insertTextMode = InsertTextMode.adjustIndentation;
    return item;
  };
}

export default TemplateMode;
