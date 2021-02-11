import {CompletionList, CompletionItem} from 'vscode-languageserver-types';

export interface OnCompletion {
  (): CompletionList
}
export interface OnCompletionResolve {
  (item: CompletionItem): CompletionItem
}

export interface LanguageMode {
  onCompletion: OnCompletion;
  onCompletionResolve: OnCompletionResolve;
}
