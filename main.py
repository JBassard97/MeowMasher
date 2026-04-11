import json
import sys
from platformdirs import user_data_dir
from pathlib import Path
import webview
import os


# --- Simple Storage class ---
class Storage:
    def __init__(self, save_file):
        self.save_file = save_file
        self._data = {}
        self._load()

        if not self.save_file.exists():
            self._save()

    def _load(self):
        if self.save_file.exists():
            try:
                with open(self.save_file, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except json.JSONDecodeError:
                self._data = {}
        else:
            self._data = {}

    def _save(self):
        with open(self.save_file, "w", encoding="utf-8") as f:
            json.dump(self._data, f, indent=2)

    def getItem(self, key):
        self._load()
        return self._data.get(key)

    def setItem(self, key, value):
        self._data[key] = value
        self._save()

    def clear(self):
        self._data = {}
        self._save()

    def replaceAll(self, new_data):
        self._data = new_data
        self._save()


# --- Use save.json in root ---
def get_base_dir():
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS)  # for bundled assets
    return Path(__file__).parent.resolve()


def get_save_path():
    data_dir = Path(user_data_dir("MeowMasher", "Meow Labs"))
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir / "save.json"


BASE_DIR = get_base_dir()
SAVE_FILE = get_save_path()

storage = Storage(SAVE_FILE)


# --- PyWebView API ---
class API:
    def getItem(self, key):
        print(f"JS requested key {key}")
        return storage.getItem(key)

    def setItem(self, key, value):
        print(f"JS set key {key} with value {value}")
        storage.setItem(key, value)
        return True

    def getAll(self):
        print(f"JS ran the 'getAll' method")
        storage._load()
        return storage._data

    def clearAll(self):
        print("JS requested clearAll")
        storage.clear()
        return True

    def replaceAll(self, new_data):
        print("JS requested replaceAll")
        storage.replaceAll(new_data)
        return True

    def exportSave(self, data):
        save_path = window.create_file_dialog(
            webview.SAVE_DIALOG,
            save_filename="Meow_File.json",
            file_types=("JSON File(*.json)",),
        )
        if save_path:
            if isinstance(save_path, tuple):
                save_path = save_path[0]
            with open(save_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            return True
        return False


api = API()

# --- PyWebView window ---
INDEX_FILE = BASE_DIR / "index.html"

window = webview.create_window(
    title="Meow Masher",
    url=INDEX_FILE.as_uri(),
    width=1000,
    height=700,
    min_size=(540, 600),
    resizable=True,
    js_api=api,  # expose API to JS
)


webview.start()
