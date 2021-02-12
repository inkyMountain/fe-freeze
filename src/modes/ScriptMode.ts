import type {LanguageMode, OnCompletion, OnCompletionResolve} from './languageMode';
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
import {afterScriptStart as positionAfterScriptStart} from '../utils/positionSeekers';

class ScriptMode implements LanguageMode {
  documentService: DocumentService;

  constructor(documentService: DocumentService) {
    this.documentService = documentService;
  }

  onCompletion: OnCompletion = (document, position, token) => {
    const methods = (adapterLibraryProvider.methods ?? []) as Array<Method>;
    const completionItems = methods
      .filter((method) => method.name.startsWith(token))
      .map((method) => {
        return {
          label: method.name,
          kind: CompletionItemKind.Unit,
          detail: method.detail,
          documentation: method.documentation,
          insertTextFormat: InsertTextFormat.Snippet,
          data: {
            position,
            uri: document.uri,
            mode: 'script',
          },
        };
      });
    return {
      isIncomplete: false,
      items: completionItems,
    };
  };

  onCompletionResolve: OnCompletionResolve = (item: CompletionItem) => {
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
}

export default ScriptMode;
