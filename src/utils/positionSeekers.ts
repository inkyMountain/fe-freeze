import {TextDocument} from 'vscode-languageserver-textdocument';
import {Position} from 'vscode-languageserver';

const regexps = {
  scriptTag: /<script.*>[\S\s]*<\/script>/,
  templateTag: /<template.*>[\S\s]*<\/template>/,
};

export const positionAfterScriptStart: (document: TextDocument) => Position | undefined = (document) => {
  const text = document.getText();
  const matchArray = text.match(regexps.scriptTag);
  const scriptTagOffset = matchArray?.index;
  // If regex of script tag matching fails, means that the file has no script tag.
  // So there's no point to return a Position object.
  if (scriptTagOffset === undefined) {
    return;
  }
  const scriptTagPosition = document.positionAt(scriptTagOffset);
  scriptTagPosition.line++;
  return scriptTagPosition;
};
