import {Connection, TextDocuments} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';

class DocumentService {
  documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    this.init();
  }

  init() {
    this.documents.onDidClose((e) => {});
    this.documents.onDidOpen(({document}) => {});
    // The content of a text document has changed. This event is emitted
    // when the text document first opened or when its content has changed.
    this.documents.onDidChangeContent((change) => {
      // can do some validation of the changed document and then send it to client.
    });
    // Make the text document manager listen on the connection
    // for open, change and close text document events
    this.documents.listen(this.connection);
  }

  getDocument(uri: string): TextDocument {
    return this.documents.get(uri);
  }
}

export default DocumentService;
