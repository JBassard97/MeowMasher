import webview

# import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()
INDEX_FILE = BASE_DIR / "index.html"

webview.create_window(
    title="Meow Masher",
    url=INDEX_FILE.as_uri(),  # important for file:// correctness
    width=1000,
    height=700,
    resizable=True,
)

webview.start()
