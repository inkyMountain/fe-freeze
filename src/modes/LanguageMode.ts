import {Position} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {CompletionList, CompletionItem} from 'vscode-languageserver-types';
import {AST} from 'vue-eslint-parser';

export interface OnCompletion {
  ({
    document,
    position,
    token,
    ast,
  }: {
    document: TextDocument;
    position: Position;
    token: string;
    ast: AST.ESLintProgram;
  }): CompletionList;
}
export interface OnCompletionResolve {
  (item: CompletionItem): Promise<CompletionItem>;
}

export interface LanguageMode {
  onCompletion: OnCompletion;
  onCompletionResolve: OnCompletionResolve;
}
