import {LanguageMode} from './languageMode';
import {NULL_COMPLETION_LIST} from 'src/variables';
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
