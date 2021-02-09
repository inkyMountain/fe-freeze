import {NULL_COMPLETION_LIST} from 'src/variables';
import {CompletionItem, CompletionList} from 'vscode-languageserver-types';
import {LanguageMode} from './languageMode';

class TemplateMode implements LanguageMode {
  onCompletion() {
    return NULL_COMPLETION_LIST;
  }
  onCompletionResolve(item: CompletionItem) {
    return item;
  }
}

export default TemplateMode;
