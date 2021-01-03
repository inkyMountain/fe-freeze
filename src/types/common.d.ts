declare module '*.json' {
  const value: string;
  export default value;
}

interface BreezeActionContext {
  document: vscode.TextDocument;
  range: vscode.Range;
  context: vscode.CodeActionContext;
  token: vscode.CancellationToken;
}
