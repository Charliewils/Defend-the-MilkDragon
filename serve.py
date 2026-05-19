#!/usr/bin/env python3
"""本地开发服务器（固定端口 8765）：对 HTML/JS/CSS 禁用缓存。"""
import http.server
import socketserver
import sys

PORT = 8765


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.split('?', 1)[0]
        if path.endswith(('.html', '.js', '.css')) or path in ('/', ''):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == '__main__':
    try:
        httpd = ReusableTCPServer(('', PORT), NoCacheHandler)
    except OSError as err:
        if err.errno == 48:
            print(f'错误：端口 {PORT} 已被占用。', file=sys.stderr)
            print('请先在其它终端按 Ctrl+C 停掉 python3 -m http.server 8765，再重新运行本脚本。', file=sys.stderr)
            print(f'查看占用：lsof -i :{PORT}', file=sys.stderr)
        else:
            print(f'启动失败：{err}', file=sys.stderr)
        sys.exit(1)

    with httpd:
        print('游戏地址（固定端口 8765）：')
        print(f'  http://127.0.0.1:{PORT}/')
        print(f'  http://localhost:{PORT}/')
        print('按 Ctrl+C 停止')
        httpd.serve_forever()
