import os
import sys
import http.server
import socketserver
import webbrowser

PORT = 5055
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 65)
        print(f"  ⚡ ProPay Studio Running on: {url}")
        print("  Pirate Wires x pleasecallmechamp.com Design Crossover")
        print("  Real-Time Banking Fraud & Cognitive Quishing Defense Agent")
        print("=" * 65)
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down ProPay Studio.")
            sys.exit(0)

if __name__ == "__main__":
    run()
