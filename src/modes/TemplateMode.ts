import {NULL_COMPLETION_LIST} from '../variables';
import {CompletionItem, CompletionList} from 'vscode-languageserver-types';
import type {LanguageMode} from './languageMode';

class TemplateMode implements LanguageMode {
  onCompletion() {
    return NULL_COMPLETION_LIST;
  }

  onCompletionResolve(item: CompletionItem) {
    return item;
  }
}

export default TemplateMode;
