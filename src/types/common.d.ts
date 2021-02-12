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
  name: string;
  snippet: Array<string>;
  detail: string;
  documentation: string;
}

interface LibraryProvider {
  packageName: string;
  methods: Array<Method>;
}
