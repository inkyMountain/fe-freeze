import * as os from 'os';
import {CompletionList} from 'vscode-languageserver-types';

export const eol = os.EOL;

export const triggerCharacters = ['.'];

export const NULL_COMPLETION_LIST: CompletionList = {
  isIncomplete: false,
  items: [],
};
