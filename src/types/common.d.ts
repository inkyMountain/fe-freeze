declare module '*.json' {
  const value: any;
  export default value;
}

interface BreezeActionContext {
  document: vscode.TextDocument;
  range: vscode.Range;
  context: vscode.CodeActionContext;
  token: vscode.CancellationToken;
}

interface Method {
  label: string;
  snippet: Array<string>;
  detail: string;
  documentation: string;
}

interface VueComponent {
  label: string;
  snippet: Array<string>;
  detail: string;
  documentation: string;
  name: string;
}

interface LibraryProvider {
  packageName: string,
  isDefaultImport?: boolean,
  defaultImportVariableName?: string,
  methods?: Array<Method>,
  components?: Array<VueComponent>,
}
