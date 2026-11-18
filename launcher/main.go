// One-file launcher for the campus walk-through.
//
// The whole site (index.html, src/, vendor/) is embedded in the program by launcher/build.sh. Started with a double
// click, it serves those files to THIS computer only (127.0.0.1) and opens the page in the default browser. Nothing is
// installed, nothing is written to disk and no other machine can reach it. Closing its window stops it.
package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

//go:embed all:site
var site embed.FS

// Content types are set here and not left to the standard library: on Windows it asks the registry, and a registry that
// calls .js "text/plain" makes browsers refuse the page's modules.
var types = map[string]string{
	".html": "text/html; charset=utf-8",
	".js":   "text/javascript; charset=utf-8",
	".mjs":  "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".css":  "text/css; charset=utf-8",
	".txt":  "text/plain; charset=utf-8",
	".md":   "text/plain; charset=utf-8",
}

func main() {
	open := flag.Bool("open", true, "open the page in the default browser")
	port := flag.Int("port", 8080, "preferred port; another free one is used if it is taken")
	tab := flag.Bool("tab", false, "open as an ordinary tab of the default browser instead of a window of its own")
	flag.Parse()

	root, err := fs.Sub(site, "site")
	if err != nil {
		fail(err)
	}
	files := http.FileServer(http.FS(root))
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ext := strings.ToLower(path.Ext(r.URL.Path))
		if strings.HasSuffix(r.URL.Path, "/") {
			ext = ".html"
		}
		if t, ok := types[ext]; ok {
			w.Header().Set("Content-Type", t)
		}
		w.Header().Set("Cache-Control", "no-cache")
		files.ServeHTTP(w, r)
	})

	ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", *port))
	if err != nil {
		ln, err = net.Listen("tcp", "127.0.0.1:0")
	}
	if err != nil {
		fail(err)
	}
	url := fmt.Sprintf("http://127.0.0.1:%d/", ln.Addr().(*net.TCPAddr).Port)

	fmt.Println("广东实验中学 3D 校园漫游（开发中 · 非官方）")
	fmt.Println()
	fmt.Println("  页面地址 / page:  " + url)
	fmt.Println("  正在打开；没有自动打开的话，把上面的地址复制到 Chrome 或 Edge 里。按 F11 可全屏。")
	fmt.Println("  玩的时候请不要关闭这个窗口；关闭这个窗口即退出。")
	fmt.Println("  Keep this window open while you play. Close it to quit.")
	fmt.Println()

	if *open {
		go func() {
			time.Sleep(300 * time.Millisecond)
			if err := openBrowser(url, *tab); err != nil {
				fmt.Println("  没能自动打开浏览器 / could not open a browser:", err)
			}
		}()
	}
	if err := http.Serve(ln, handler); err != nil {
		fail(err)
	}
}

// openBrowser shows the page. On Windows it first tries a window of its own, without tabs or address bar, in Chrome or
// Edge if one is installed in a usual place ("--app" mode); otherwise, or with -tab, the default browser opens a tab.
func openBrowser(url string, tab bool) error {
	switch runtime.GOOS {
	case "windows":
		if !tab {
			for _, rel := range []string{`Google\Chrome\Application\chrome.exe`, `Microsoft\Edge\Application\msedge.exe`} {
				for _, base := range []string{os.Getenv("ProgramFiles"), os.Getenv("ProgramFiles(x86)"), os.Getenv("LocalAppData")} {
					if base == "" {
						continue
					}
					exe := filepath.Join(base, rel)
					if _, err := os.Stat(exe); err == nil && exec.Command(exe, "--app="+url, "--start-maximized").Start() == nil {
						return nil
					}
				}
			}
		}
		return exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		return exec.Command("open", url).Start()
	default:
		return exec.Command("xdg-open", url).Start()
	}
}

// fail prints the error and waits for Enter, so that a window opened by a double click does not vanish with the message.
func fail(err error) {
	fmt.Println("出错了 / error:", err)
	fmt.Println("按回车键退出 / press Enter to quit")
	fmt.Scanln()
	os.Exit(1)
}
