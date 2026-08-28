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
def search(q: str | None = None, unit: str | None = None, department: str | None = None, position: str | None = None, room: str | None = None):
    results = []

    for record in records:

        if unit is not None:
            if record.get("nazwa_jednostki", "").strip() == unit.strip():
                results.append(record)
        elif department is not None:
            if record.get("nazwa_komorki", "").strip() == department.strip():
                results.append(record)
        elif position is not None:
            if record.get("stanowisko", "").strip() == position.strip():
                results.append(record)
        elif room is not None:
            if record.get("pokoj", "").strip() == room.strip():
                results.append(record)
        elif q is not None:
            query = q.strip().lower()

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

@app.get("/api/filters")
def get_filters():
    units = set()
    departments = set()
    positions = set()
    rooms = set()

    for record in records:
        unit = record.get("nazwa_jednostki", "").strip()
        department = record.get("nazwa_komorki", "").strip()
        position = record.get("stanowisko", "").strip()
        room = record.get("pokoj", "").strip()

        if unit:
            units.add(unit)
        if department:
            departments.add(department)
        if position:
            positions.add(position)
        if room:
            rooms.add(room)

    return {
        "units": sorted(units),
        "departments": sorted(departments),
        "positions": sorted(positions),
        "rooms": sorted(rooms)
    }


app.mount("/", StaticFiles(directory=BASE_DIR /"static", html=True), name="static")

# python -m uvicorn server:app --reload