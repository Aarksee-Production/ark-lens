import * as vscode from 'vscode';
import * as path from 'path';
import * as crypto from 'crypto';

export class ViewerProvider implements vscode.Disposable {
  private panel: vscode.WebviewPanel | undefined;
  private extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];

  constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri;
  }

  openFile(document: vscode.TextDocument, column: vscode.ViewColumn) {
    const filePath = document.uri.fsPath;
    const fileName = path.basename(filePath);
    const fileType = this.getFileType(filePath);
    const content = document.getText();
    const fileDir = vscode.Uri.file(path.dirname(filePath));

    if (this.panel) {
      this.panel.reveal(column);
      this.sendFileToWebview(filePath, fileName, fileType, content, fileDir);
    } else {
      this.createPanel(column, fileDir);
      // Small delay to ensure webview is ready
      setTimeout(() => {
        this.sendFileToWebview(filePath, fileName, fileType, content, fileDir);
      }, 100);
    }
  }

  private createPanel(column: vscode.ViewColumn, fileDir: vscode.Uri) {
    const localRoots = [
      vscode.Uri.joinPath(this.extensionUri, 'dist'),
      vscode.Uri.joinPath(this.extensionUri, 'media'),
      fileDir,
    ];

    // Add workspace folders as local resource roots
    if (vscode.workspace.workspaceFolders) {
      for (const folder of vscode.workspace.workspaceFolders) {
        localRoots.push(folder.uri);
      }
    }

    this.panel = vscode.window.createWebviewPanel(
      'arkLens',
      'Ark Lens',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: localRoots,
      }
    );

    this.panel.webview.html = this.getHtmlForWebview(this.panel.webview);

    this.panel.webview.onDidReceiveMessage(
      (message) => this.handleMessage(message),
      undefined,
      this.disposables
    );

    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
      },
      undefined,
      this.disposables
    );

    // Send saved settings
    this.sendSettings();
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview.js')
    );
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview.css')
    );
    const cspSource = webview.cspSource;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${cspSource} vscode-resource: data:; font-src ${cspSource}; media-src ${cspSource} vscode-resource:; connect-src 'none';">
  <title>Ark Lens</title>
  <link rel="stylesheet" href="${cssUri}">
</head>
<body>
  <div id="app">
    <div id="tab-bar">
      <div id="tab-scroll-container"></div>
    </div>
    <div id="viewer-body">
      <div id="toc-sidebar"></div>
      <div id="content-area">
        <div id="content"></div>
      </div>
    </div>
    <div id="control-bar"></div>
  </div>
  <div id="empty-state">
    <div class="empty-title">Ark Lens</div>
    <p>Open a Markdown or HTML file to preview</p>
    <p class="shortcut">Ctrl+Shift+L to open current file</p>
  </div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private sendFileToWebview(
    filePath: string,
    fileName: string,
    fileType: 'md' | 'html',
    content: string,
    fileDir: vscode.Uri
  ) {
    if (!this.panel) return;

    // Resolve local resource paths for the webview
    const webview = this.panel.webview;
    const fileDirWebviewUri = webview.asWebviewUri(fileDir).toString();

    this.panel.webview.postMessage({
      type: 'openFile',
      filePath,
      fileName,
      fileType,
      content,
      basePath: fileDirWebviewUri,
    });
  }

  refreshFile(filePath: string, content: string) {
    if (!this.panel) return;
    this.panel.webview.postMessage({
      type: 'updateFile',
      filePath,
      content,
    });
  }

  closeFile(filePath: string) {
    if (!this.panel) return;
    this.panel.webview.postMessage({
      type: 'closeFile',
      filePath,
    });
  }

  postMessage(message: any) {
    this.panel?.webview.postMessage(message);
  }

  private sendSettings() {
    const config = vscode.workspace.getConfiguration('arkLens');
    this.postMessage({
      type: 'initSettings',
      settings: {
        theme: config.get('theme', 'auto'),
        fontSize: config.get('fontSize', 16),
        fontFamily: config.get('fontFamily', 'system'),
        contentWidth: config.get('contentWidth', 'medium'),
        tocVisible: config.get('tocVisible', true),
        maxTabs: config.get('maxTabs', 10),
      },
    });
  }

  private static readonly ALLOWED_SETTINGS = new Set([
    'theme', 'fontSize', 'fontFamily', 'contentWidth', 'tocVisible', 'maxTabs',
  ]);

  private handleMessage(message: any) {
    switch (message.type) {
      case 'settingChanged':
        if (!ViewerProvider.ALLOWED_SETTINGS.has(message.key)) return;
        vscode.workspace
          .getConfiguration('arkLens')
          .update(message.key, message.value, vscode.ConfigurationTarget.Global);
        break;
      case 'tabChanged':
        if (this.panel) {
          this.panel.title = `Ark Lens: ${message.fileName}`;
        }
        break;
      case 'ready':
        this.sendSettings();
        break;
    }
  }

  private getFileType(filePath: string): 'md' | 'html' {
    const ext = filePath.toLowerCase();
    if (ext.endsWith('.html') || ext.endsWith('.htm')) return 'html';
    return 'md';
  }

  dispose() {
    this.panel?.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
  }
}

function getNonce(): string {
  return crypto.randomBytes(24).toString('base64url');
}
