import {NULL_COMPLETION_LIST} from '../variables';
import {CompletionItem, CompletionList} from 'vscode-languageserver-types';
import type {LanguageMode} from './languageMode';
import DocumentService from 'src/services/documentService';

class TemplateMode implements LanguageMode {
  documentService: DocumentService;
  constructor(documentService: DocumentService) {
    this.documentService = documentService;
  }

  onCompletion() {
    return NULL_COMPLETION_LIST;
  }

  onCompletionResolve(item: CompletionItem) {
    return item;
  }
}

export default TemplateMode;
