const vscode = require("vscode");
const fs = require("fs");

function activate(context: any) {
  let disposable = vscode.commands.registerCommand(
    "extension.goToHandler",
    function() {
      if (!vscode.workspace.name) {
        return;
      }

      const activeFile = vscode.window.activeTextEditor;
      if (!activeFile) {
        return;
      }

      const openedFilename = activeFile.document.fileName;
      const isCodeFile = /(.*(\/.*\/))(.*)(\.\w+)$/;

      const openedFile = openedFilename.match(isCodeFile);

      if (!openedFile) {
        return;
      }

      const path = openedFile[1];
      const lastPath = openedFile[2];
      const filenameWithoutExtension = openedFile[3];
      const filenameExtension = openedFile[4];

      const isHandlerFile = /(handler|Handler)\./;
      const sufixHandler = ["Handler", "handler"];
      if (!isHandlerFile.test(openedFile)) {
        const sufixToOpen = sufixHandler
          .map(
            handler =>
              `${path}${filenameWithoutExtension}${handler}${filenameExtension}`
          )
          .filter(handler => fs.existsSync(handler));
        if (sufixToOpen.length > 0) {
          vscode.workspace
            .openTextDocument(vscode.Uri.file(sufixToOpen[0]))
            .then(vscode.window.showTextDocument);
        }
        // fix: not finding file across folders
        // else {
        //   const fileToOpen = `${filenameWithoutExtension}Handler${filenameExtension}`;
        //   vscode.workspace
        //     .findFiles(fileToOpen, "**/node_modules/**")
        //     .then((files: any) => {
        //       vscode.workspace
        //         .openTextDocument(vscode.Uri.file(files[0].fsPath))
        //         .then(vscode.window.showTextDocument);
        //     });
        // }
      } else {
        let fileToOpen = openedFilename;
        sufixHandler.forEach(handler => {
          fileToOpen = fileToOpen.replace(handler, "");
        });
        if (fs.existsSync(fileToOpen)) {
          vscode.workspace
            .openTextDocument(vscode.Uri.file(fileToOpen))
            .then(vscode.window.showTextDocument);
        }
        // fix: not finding file across folders
        // else {
        //   fileToOpen = `**${lastPath}${filenameWithoutExtension}${filenameExtension}`.replace(
        //     "Handler",
        //     ""
        //   );
        //   vscode.workspace
        //     .findFiles(fileToOpen, "**/node_modules/**")
        //     .then((files: any) => {
        //       vscode.workspace
        //         .openTextDocument(vscode.Uri.file(files[0].fsPath))
        //         .then(vscode.window.showTextDocument);
        //     });
        // }
      }
    }
  );

  context.subscriptions.push(disposable);
}

exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;
