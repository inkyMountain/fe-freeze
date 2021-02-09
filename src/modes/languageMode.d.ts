import {CompletionList, CompletionItem} from 'vscode-languageserver-types';

export interface LanguageMode {
  onCompletion: () => CompletionList;
  onCompletionResolve: (item: CompletionItem) => CompletionItem;
}
