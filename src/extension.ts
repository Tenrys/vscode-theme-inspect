// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path from "path"
import * as vscode from "vscode"

type Theme = {
  label?: string
  uiTheme?: string
  path?: string
}
type ThemeExtensionPackage = {
  contributes?: {
    themes?: Theme[]
  }
}

// TODO: Optimize this.
// * Ideally I would want to load all extensions and themes once and cache them, and listen to `onDidChange` to update it.
const findExtensionForTheme = (themeName: string) => {
  const extensions = vscode.extensions.all
  for (const extension of extensions) {
    const packageJSON = extension.packageJSON as ThemeExtensionPackage

    if (!packageJSON.contributes?.themes) {
      continue
    }

    for (const theme of packageJSON.contributes.themes) {
      if (theme.label === themeName) {
        return { extension, theme }
      }
    }
  }
  return {}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "theme-inspect.open-current-theme",
    () => {
      const currentTheme = vscode.workspace
        .getConfiguration()
        .get("workbench.colorTheme") as string

      const { extension, theme } = findExtensionForTheme(currentTheme)
      if (!theme?.path) {
        vscode.window.showErrorMessage(`Theme ${currentTheme} not found`)
        return
      }

      const themePath = path.join(extension.extensionPath, theme.path)
      vscode.workspace.openTextDocument(vscode.Uri.file(themePath)).then(
        (doc) => {
          vscode.window.showTextDocument(doc)
        },
        (err) => {
          vscode.window.showErrorMessage(`Failed to open theme file: ${err}`)
        }
      )
    }
  )

  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
