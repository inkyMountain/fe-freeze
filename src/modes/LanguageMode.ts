import { Position } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {CompletionList, CompletionItem} from 'vscode-languageserver-types';

export interface OnCompletion {
  (document: TextDocument, position: Position, token: string): CompletionList
}
export interface OnCompletionResolve {
  (item: CompletionItem): CompletionItem
}

export interface LanguageMode {
  onCompletion: OnCompletion;
  onCompletionResolve: OnCompletionResolve;
}
