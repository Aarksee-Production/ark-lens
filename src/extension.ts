import * as vscode from 'vscode';
import { ViewerProvider } from './providers/viewerProvider';

export function activate(context: vscode.ExtensionContext) {
  const viewerProvider = new ViewerProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.commands.registerCommand('arkLens.openPreview', (uri?: vscode.Uri) => {
      handleOpen(viewerProvider, uri, vscode.ViewColumn.Beside);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('arkLens.openPreviewToSide', (uri?: vscode.Uri) => {
      handleOpen(viewerProvider, uri, vscode.ViewColumn.Beside);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('arkLens.toggleTheme', () => {
      viewerProvider.postMessage({ type: 'toggleTheme' });
    })
  );

  // Auto-refresh when text document changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(
      debounce((event: vscode.TextDocumentChangeEvent) => {
        const filePath = event.document.uri.fsPath;
        if (isSupported(event.document)) {
          viewerProvider.refreshFile(filePath, event.document.getText());
        }
      }, 300)
    )
  );

  context.subscriptions.push(viewerProvider);
}

async function handleOpen(
  provider: ViewerProvider,
  uri: vscode.Uri | undefined,
  column: vscode.ViewColumn
) {
  let doc: vscode.TextDocument | undefined;

  if (uri) {
    doc = await vscode.workspace.openTextDocument(uri);
  } else {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(
        'Ark Lens: No active editor. Open a Markdown or HTML file first.'
      );
      return;
    }
    doc = editor.document;
  }

  if (!doc || !isSupported(doc)) {
    vscode.window.showInformationMessage(
      'Ark Lens: Only Markdown and HTML files are supported.'
    );
    return;
  }

  provider.openFile(doc, column);
}

function isSupported(doc: vscode.TextDocument): boolean {
  const langId = doc.languageId;
  const ext = doc.uri.fsPath.toLowerCase();
  return (
    langId === 'markdown' ||
    langId === 'html' ||
    ext.endsWith('.md') ||
    ext.endsWith('.html') ||
    ext.endsWith('.htm')
  );
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as unknown as T;
}

export function deactivate() {}
