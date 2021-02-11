import type {LanguageMode} from './languageMode';
import {NULL_COMPLETION_LIST} from '../variables';
import {CompletionItem} from 'vscode-languageclient';

class ScriptMode implements LanguageMode {
  onCompletion() {
    return NULL_COMPLETION_LIST;
  }
  onCompletionResolve(item: CompletionItem) {
    return item;
  }
}

export default ScriptMode;
