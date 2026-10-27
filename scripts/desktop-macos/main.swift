import Cocoa
import WebKit
import Carbon

class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate, WKScriptMessageHandler {
    var workbenchWindow: NSWindow!
    var assistantWindow: NSWindow!
    var workbenchWebView: WKWebView!
    var assistantWebView: WKWebView!
    var statusItem: NSStatusItem!
    var globalEventMonitor: Any?
    var localEventMonitor: Any?

    var lastTargetApp: NSRunningApplication?

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupMainMenu()
        setupStatusBar()
        setupWorkbenchWindow()
        setupAssistantWindow()
        setupGlobalHotkey()
        checkAccessibilityOnLaunch()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        // Keep running in menu bar even if workbench is closed
        return false
    }

    // ==========================================
    // STATUS BAR / MENU BAR ITEM
    // ==========================================

    private func setupStatusBar() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let button = statusItem.button {
            button.title = "✨ Lingually"
            button.action = #selector(statusBarButtonClicked(_:))
            button.target = self
        }

        let menu = NSMenu()
        let statusTitleItem = NSMenuItem(title: "● Lingually: Ready (⌥Space)", action: nil, keyEquivalent: "")
        statusTitleItem.isEnabled = false
        menu.addItem(statusTitleItem)
        menu.addItem(NSMenuItem.separator())

        menu.addItem(withTitle: "Quick Assist Active App", action: #selector(triggerQuickAssist), keyEquivalent: " ")
        menu.items.last?.keyEquivalentModifierMask = [.option]

        menu.addItem(withTitle: "Open Writing Workbench", action: #selector(showWorkbench), keyEquivalent: "o")
        menu.addItem(withTitle: "AI Provider Settings", action: #selector(showSettings), keyEquivalent: ",")
        menu.addItem(NSMenuItem.separator())

        menu.addItem(withTitle: "Check Accessibility Permissions...", action: #selector(requestAccessibilityPrompt), keyEquivalent: "")
        menu.addItem(NSMenuItem.separator())

        menu.addItem(withTitle: "Quit Lingually", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

        statusItem.menu = menu
    }

    @objc private func statusBarButtonClicked(_ sender: Any?) {
        // Handled by menu
    }

    // ==========================================
    // WORKBENCH WINDOW (FULL EDITOR & SETTINGS)
    // ==========================================

    private func setupWorkbenchWindow() {
        let screenRect = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1200, height: 800)
        let width = min(1160, screenRect.width * 0.9)
        let height = min(800, screenRect.height * 0.9)
        let rect = NSRect(
            x: (screenRect.width - width) / 2 + screenRect.origin.x,
            y: (screenRect.height - height) / 2 + screenRect.origin.y,
            width: width,
            height: height
        )

        workbenchWindow = NSWindow(
            contentRect: rect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        workbenchWindow.center()
        workbenchWindow.title = "Lingually — AI Writing Workbench"
        workbenchWindow.minSize = NSSize(width: 820, height: 520)
        workbenchWindow.delegate = self

        let config = createWebViewConfiguration()
        workbenchWebView = WKWebView(frame: workbenchWindow.contentView!.bounds, configuration: config)
        workbenchWebView.autoresizingMask = [.width, .height]
        workbenchWindow.contentView?.addSubview(workbenchWebView)

        loadLocalHTML(into: workbenchWebView, query: "")

        workbenchWindow.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    // ==========================================
    // FLOATING QUICK ASSISTANT WINDOW
    // ==========================================

    private func setupAssistantWindow() {
        let width: CGFloat = 480
        let height: CGFloat = 580
        let screenRect = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1200, height: 800)
        let rect = NSRect(
            x: (screenRect.width - width) / 2 + screenRect.origin.x,
            y: (screenRect.height - height) / 2 + screenRect.origin.y,
            width: width,
            height: height
        )

        assistantWindow = NSWindow(
            contentRect: rect,
            styleMask: [.titled, .closable, .resizable],
            backing: .buffered,
            defer: false
        )
        assistantWindow.title = "Lingually Quick Assist"
        assistantWindow.level = .floating
        assistantWindow.isMovableByWindowBackground = true
        assistantWindow.isReleasedWhenClosed = false

        let config = createWebViewConfiguration()
        assistantWebView = WKWebView(frame: assistantWindow.contentView!.bounds, configuration: config)
        assistantWebView.autoresizingMask = [.width, .height]
        assistantWindow.contentView?.addSubview(assistantWebView)

        loadLocalHTML(into: assistantWebView, query: "?mode=quick-assist")
    }

    private func createWebViewConfiguration() -> WKWebViewConfiguration {
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        config.setValue(true, forKey: "allowUniversalAccessFromFileURLs")

        let controller = WKUserContentController()
        controller.add(self, name: "lingually")
        config.userContentController = controller
        return config
    }

    private func loadLocalHTML(into targetWebView: WKWebView, query: String) {
        var loaded = false
        if let resourcePath = Bundle.main.resourcePath {
            let htmlPath = (resourcePath as NSString).appendingPathComponent("www/index.html")
            if FileManager.default.fileExists(atPath: htmlPath) {
                let fileURL = URL(fileURLWithPath: htmlPath)
                let baseDir = fileURL.deletingLastPathComponent()
                if query.isEmpty {
                    targetWebView.loadFileURL(fileURL, allowingReadAccessTo: baseDir)
                } else if let urlWithQuery = URL(string: fileURL.absoluteString + query) {
                    targetWebView.loadFileURL(urlWithQuery, allowingReadAccessTo: baseDir)
                }
                loaded = true
            }
        }

        if !loaded {
            let fallbackURL = URL(string: "https://lingually-os.vercel.app/editor")!
            targetWebView.load(URLRequest(url: fallbackURL))
        }
    }

    // ==========================================
    // GLOBAL HOTKEY: OPTION + SPACE (⌥Space)
    // ==========================================

    private func setupGlobalHotkey() {
        // Global monitor for events occurring in background apps
        globalEventMonitor = NSEvent.addGlobalMonitorForEvents(matching: .keyDown) { [weak self] event in
            // Option Key (524288) and Space (Key code 49)
            if event.modifierFlags.contains(.option) && event.keyCode == 49 {
                DispatchQueue.main.async {
                    self?.triggerQuickAssist()
                }
            }
        }

        // Local monitor when Lingually is already the active app
        localEventMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            if event.modifierFlags.contains(.option) && event.keyCode == 49 {
                self?.triggerQuickAssist()
                return nil
            }
            return event
        }
    }

    @objc func triggerQuickAssist() {
        // Capture active frontmost application before focusing Lingually
        let frontApp = NSWorkspace.shared.frontmostApplication
        if frontApp?.bundleIdentifier != Bundle.main.bundleIdentifier {
            lastTargetApp = frontApp
        }

        let appName = lastTargetApp?.localizedName ?? "Active App"
        let selectedText = getActiveSelectedText()

        // Show floating assistant window
        assistantWindow.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        // Transfer captured text to the assistant webview
        let escapedText = escapeForJavaScript(selectedText)
        let escapedApp = escapeForJavaScript(appName)
        let script = "if (window.linguallyBridge) { window.linguallyBridge.onSelectedTextReceived(\(escapedText), \(escapedApp)); }"
        assistantWebView.evaluateJavaScript(script, completionHandler: nil)
    }

    @objc func showWorkbench() {
        workbenchWindow.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc func showSettings() {
        showWorkbench()
        workbenchWebView.evaluateJavaScript("if (window.linguallyBridge) { window.linguallyBridge.openSettings(); }", completionHandler: nil)
    }

    @objc func requestAccessibilityPrompt() {
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        _ = AXIsProcessTrustedWithOptions(options)
    }

    private func checkAccessibilityOnLaunch() {
        if !AXIsProcessTrusted() {
            // Prompt user once for accessibility on launch
            let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
            _ = AXIsProcessTrustedWithOptions(options)
        }
    }

    // ==========================================
    // TEXT INSPECTION VIA ACCESSIBILITY & CLIPBOARD
    // ==========================================

    private func getActiveSelectedText() -> String {
        // 1. Try macOS Accessibility API
        if AXIsProcessTrusted() {
            let systemWide = AXUIElementCreateSystemWide()
            var focusedElement: AnyObject?
            let focusResult = AXUIElementCopyAttributeValue(systemWide, kAXFocusedUIElementAttribute as CFString, &focusedElement)

            if focusResult == .success, let element = focusedElement {
                var selectedTextValue: AnyObject?
                let textResult = AXUIElementCopyAttributeValue(element as! AXUIElement, kAXSelectedTextAttribute as CFString, &selectedTextValue)

                if textResult == .success, let text = selectedTextValue as? String, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    return text
                }
            }
        }

        // 2. Fallback: Quick Copy simulation
        let pasteboard = NSPasteboard.general
        let previousChangeCount = pasteboard.changeCount

        simulateCommandKey(key: 8) // 'C' key

        // Wait brief moment for pasteboard change
        usleep(40000) // 40ms
        if pasteboard.changeCount != previousChangeCount, let text = pasteboard.string(forType: .string) {
            return text
        }

        return ""
    }

    private func replaceActiveSelectedText(with replacement: String) {
        // Hide assistant window first so focus returns to the target app
        assistantWindow.orderOut(nil)

        if let target = lastTargetApp {
            target.activate(options: .activateIgnoringOtherApps)
            usleep(50000) // 50ms for target window activation
        }

        // Put replacement on pasteboard and simulate Paste (⌘V)
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(replacement, forType: .string)

        usleep(30000)
        simulateCommandKey(key: 9) // 'V' key
    }

    private func simulateCommandKey(key: CGKeyCode) {
        let src = CGEventSource(stateID: .hidSystemState)
        let keyDown = CGEvent(keyboardEventSource: src, virtualKey: key, keyDown: true)
        keyDown?.flags = .maskCommand
        let keyUp = CGEvent(keyboardEventSource: src, virtualKey: key, keyDown: false)
        keyUp?.flags = .maskCommand

        keyDown?.post(tap: .cghidEventTap)
        keyUp?.post(tap: .cghidEventTap)
    }

    // ==========================================
    // WEBKIT MESSAGE HANDLER BRIDGE
    // ==========================================

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let dict = message.body as? [String: Any], let type = dict["type"] as? String else {
            return
        }

        switch type {
        case "REPLACE_IN_APP":
            if let text = dict["text"] as? String {
                replaceActiveSelectedText(with: text)
            }
        case "OPEN_WORKBENCH":
            showWorkbench()
        case "OPEN_SETTINGS":
            showSettings()
        case "CHECK_ACCESSIBILITY":
            requestAccessibilityPrompt()
        default:
            break
        }
    }

    private func escapeForJavaScript(_ string: String) -> String {
        do {
            let data = try JSONSerialization.data(withJSONObject: [string], options: [])
            if let jsonString = String(data: data, encoding: .utf8) {
                // Returns ["string"], extract inner string
                return String(jsonString.dropFirst().dropLast())
            }
        } catch {
            //
        }
        return "\"\""
    }

    // ==========================================
    // MAIN APP MENU
    // ==========================================

    private func setupMainMenu() {
        let mainMenu = NSMenu()

        // App Menu
        let appMenuItem = NSMenuItem()
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "About Lingually", action: nil, keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Preferences...", action: #selector(showSettings), keyEquivalent: ",")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Hide Lingually", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        let hideOthers = NSMenuItem(title: "Hide Others", action: #selector(NSApplication.hideOtherApplications(_:)), keyEquivalent: "h")
        hideOthers.keyEquivalentModifierMask = [.command, .option]
        appMenu.addItem(hideOthers)
        appMenu.addItem(withTitle: "Show All", action: #selector(NSApplication.unhideAllApplications(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Quit Lingually", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appMenuItem.submenu = appMenu
        mainMenu.addItem(appMenuItem)

        // Edit Menu
        let editMenuItem = NSMenuItem()
        let editMenu = NSMenu(title: "Edit")
        editMenu.addItem(withTitle: "Undo", action: Selector(("undo:")), keyEquivalent: "z")
        editMenu.addItem(withTitle: "Redo", action: Selector(("redo:")), keyEquivalent: "Z")
        editMenu.addItem(NSMenuItem.separator())
        editMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editMenuItem.submenu = editMenu
        mainMenu.addItem(editMenuItem)

        NSApp.mainMenu = mainMenu
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
