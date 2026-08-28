import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent

DATA_FILE = BASE_DIR / "output.json"

with open(DATA_FILE, "r", encoding="utf-8") as file:
    data = json.load(file)
records = data["data"]

@app.get("/api/search")
def search(q: str):
    query = q.strip().lower()
    results=[]

    for record in records:
        searchable_text = " ".join([
        record.get("nazwisko_i_imie", ""),
        record.get("nazwa_jednostki", ""),
        record.get("nazwa_komorki", ""),
        record.get("stanowisko", ""),
        record.get("pokoj", ""),
        record.get("telefon", "")    
        ])

        if query in searchable_text.lower():
            results.append(record)

    groups = {}
    for record in results:
        name = record.get("nazwisko_i_imie", "")
        
        if name not in groups:
            groups[name] = []

        groups[name].append(record)
    
    grouped_results = []
    for name, entries in groups.items():
        grouped_results.append({
            "nazwisko_i_imie": name,
            "entries": entries
        })

    print(results)
    return {
    "query": q,
    "count": len(grouped_results),
    "results": grouped_results
}


app.mount("/", StaticFiles(directory=BASE_DIR /"static", html=True), name="static")

# python -m uvicorn server:app --reload


# przyciski skróty grupy 
# przejscia z wydzialuj do grupy wydzialow 