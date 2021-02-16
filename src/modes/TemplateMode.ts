import {NULL_COMPLETION_LIST, eol, triggerCharacters} from '../variables';
import {
  CompletionItem,
  CompletionList,
  CompletionItemKind,
  InsertTextFormat,
  InsertTextMode,
  Range,
} from 'vscode-languageserver-types';
import {TextEdit, Position} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import type {
  LanguageMode,
  OnCompletion,
  OnCompletionResolve,
} from './languageMode';
import DocumentService from 'src/services/documentService';
import zzuiLibraryProvider from '../libraryProvider/zzui';
import {positionAfterScriptStart} from '../utils/positionSeekers';
import {createImportRegExps} from '../utils/textEdit';

const NULL_EDIT = TextEdit.insert(Position.create(0, 0), '');

class TemplateMode implements LanguageMode {
  documentService: DocumentService;
  constructor(documentService: DocumentService) {
    this.documentService = documentService;
  }

  onCompletion: OnCompletion = ({ast, position, token, document}) => {
    const components = zzuiLibraryProvider.components.filter((component) =>
      component.label.startsWith(token),
    );
    const completionItems: Array<CompletionItem> = components.map(
      (component) => {
        return {
          label: component.label,
          kind: CompletionItemKind.Unit,
          detail: component.detail,
          documentation: component.documentation,
          insertTextFormat: InsertTextFormat.Snippet,
          // Use letter 'a' as sortText to make sure that
          // items provided in this plugin takes the highest priority.
          sortText: 'a',
          data: {
            position,
            uri: document.uri,
            mode: 'template',
            packageName: zzuiLibraryProvider.packageName,
            component,
            identifier: component.name,
          },
        };
      },
    );
    return {
      isIncomplete: false,
      items: completionItems,
    };
  };

  onCompletionResolve: OnCompletionResolve = async (item: CompletionItem) => {
    const {position, uri, packageName, component, identifier} = item.data;
    const document = this.documentService.getDocument(uri);

    if (!document) {
      return item;
    }

    item.insertText = component.snippet.join(eol);
    item.insertTextFormat = InsertTextFormat.Snippet;
    item.additionalTextEdits = item.additionalTextEdits ?? [];

    const edits = [];

    // Handle Vue object import.
    edits.push(this.createVueImportTextEdits(document));
    edits.push(
      this.createZzuiImportTextEdits(document, {identifier, packageName}),
    );
    edits.push(
      ...this.createVueUseTextEdits(document, {identifier, packageName}),
    );

    item.additionalTextEdits.push(...edits);

    item.insertTextMode = InsertTextMode.adjustIndentation;
    return item;
  };

  // Return a TextEdit object that does nothing if Vue has already been imported,
  // else return a TextEdit importing Vue.
  createVueImportTextEdits = (document: TextDocument) => {
    const regExps = createImportRegExps(['Vue'], 'vue', true);
    const matchedArrays = regExps.reduce<RegExpMatchArray[]>(
      (matches, regExp) => {
        return matches.concat([...document.getText().matchAll(regExp)]);
      },
      [],
    );
    const isVueImported = matchedArrays.length > 0;
    if (!isVueImported) {
      return TextEdit.insert(
        positionAfterScriptStart(document),
        `import Vue from 'vue'${eol}`,
      );
    }
    return NULL_EDIT;
  };

  // Return a TextEdit object that does nothing
  // if the confirmed component has already been imported,
  // else return a TextEdit importing Vue.
  createZzuiImportTextEdits = (
    document: TextDocument,
    {identifier, packageName}: {identifier: string; packageName: string},
  ) => {
    const regExps = [
      new RegExp(
        `import\\s+\\{(.*)\\}\\s+from\\s+'${packageName}'`,
        'g',
      ),
      new RegExp(
        `import\\s+\\{(.*)\\}\\s+from\\s+"${packageName}"`,
        'g',
      ),
    ];
    const matchedArrays = regExps.reduce<RegExpMatchArray[]>(
      (matches, regExp) => {
        const matchArray = [...document.getText().matchAll(regExp)];
        return matches.concat(matchArray);
      },
      [],
    );
    if (matchedArrays.length === 0) {
      return TextEdit.insert(
        positionAfterScriptStart(document),
        `import {${identifier}} from '${packageName}'${eol}`,
      );
    }

    const [importStatement, existComponents] = matchedArrays[0];
    const isTargetComponentImported = existComponents
      .split(',')
      .map((component) => component.trim())
      .filter(Boolean)
      .includes(identifier);
    if (isTargetComponentImported) {
      return NULL_EDIT;
    }

    const replacementStartOffset = matchedArrays[0].index;
    const replacementEndOffset =
      replacementStartOffset + importStatement.length;
    const newComponents = existComponents
      .split(',')
      .map(component => component.trim())
      .filter(Boolean)
      .concat(identifier)
      .join(', ');
    const newImportText = `import {${newComponents}} from '${packageName}'`;
    return TextEdit.replace(
      Range.create(
        document.positionAt(replacementStartOffset),
        document.positionAt(replacementEndOffset),
      ),
      newImportText,
    );
  };

  // Returns array of TextEdit even though only
  createVueUseTextEdits = (
    document: TextDocument,
    {identifier, packageName}: {identifier: string; packageName: string},
  ): TextEdit[] => {
    const vueUseRegExp = new RegExp(`Vue(\\.use\\([a-zA-Z]*\\))+`, 'g');
    const text = document.getText();
    const matches = [...text.matchAll(vueUseRegExp)];

    // case A: If there's no Vue.use statement, insert it after all import statements.
    // case B: If no any import statement, insert Vue.use after script tag.
    if (matches.length === 0) {
      // case A
      const importStatementsRegExp = /(import\s+\{?.*\}?\s+from\s+['"].*['"];?\s*)+/;
      const importStatementsRegExpMatchArray = text.match(
        importStatementsRegExp,
      );
      if (importStatementsRegExpMatchArray === null) {
        return [
          TextEdit.insert(
            positionAfterScriptStart(document),
            `Vue.use(${identifier})${eol}`,
          ),
        ];
      }

      // case B
      const [importStatementsText] = importStatementsRegExpMatchArray;
      const vueUseInsertionOffset =
        importStatementsRegExpMatchArray.index + importStatementsText.length;
      return [
        TextEdit.insert(
          document.positionAt(vueUseInsertionOffset),
          `Vue.use(${identifier})${eol}`,
        ),
      ];
    }

    // If there exists Vue.use statement, checks if containing target component.
    // (case C) Return null edit if contains, (case D) else insert target.
    const existComponents = matches.reduce<string[]>(
      (accumulate, [vueUseStatement]) => {
        const componentsInPerStatement = [
          ...vueUseStatement.matchAll(/\.use\(([a-zA-Z]+)\)+/g),
        ].reduce<string[]>((components, [useCall, component]) => {
          return components.concat(component);
        }, []);
        return accumulate.concat(componentsInPerStatement);
      },
      [],
    );
    const isTargetComponentContained = existComponents.includes(identifier);
    // case C
    if (isTargetComponentContained) {
      return [NULL_EDIT];
    }

    // 到这里我拿到了第一行 Vue.use 语句，需要把目标组件的 use() 加到它的末尾。
    // case D
    const [firstVueUseStatement] = matches[0];
    const firstVueUseStatementStartOffset = matches[0].index;
    const firstVueUseStatementEndOffset =
      firstVueUseStatementStartOffset + firstVueUseStatement.length;
    const newUseStatementToReplace = `${firstVueUseStatement}.use(${identifier})`;
    return [
      TextEdit.replace(
        Range.create(
          document.positionAt(firstVueUseStatementStartOffset),
          document.positionAt(firstVueUseStatementEndOffset),
        ),
        newUseStatementToReplace,
      ),
    ];
  };
}

export default TemplateMode;
