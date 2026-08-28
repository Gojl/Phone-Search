const form = document.querySelector("#searchForm");
const input = document.querySelector("#searchInput");
const results = document.querySelector("#results");
const resultsInfo = document.querySelector("#resultsInfo");
const resultsTable = document.querySelector("#resultsTable");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) {
        return;
    }
    await search(query);
});

async function search(query) {
    const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    displayResults(data);
}

async function searchUnit(unit) {
    input.value = unit;
    const response = await fetch(
        `/api/search?unit=${encodeURIComponent(unit)}`
    );
    const data = await response.json();
    displayResults(data);
}


async function searchDepartment(department) {
    input.value = department;
    const response = await fetch(
        `/api/search?department=${encodeURIComponent(department)}`
    );
    const data = await response.json();
    displayResults(data);
}


async function searchRoom(room) {
    input.value = room;
    const response = await fetch(
        `/api/search?room=${encodeURIComponent(room)}`
    );
    const data = await response.json();
    displayResults(data);
}

function displayResults(data) {
    results.innerHTML = "";
    resultsTable.classList.remove("d-none");
    if (data.count === 0) {
        resultsInfo.textContent = "Nie znaleziono wyników.";
        return;
    }

    resultsInfo.textContent = `Znaleziono: ${data.count}`;
    for (const person of data.results) {
        const entries = person.entries;
        for (let i = 0; i < entries.length; i++) {
            const record = entries[i];
            const row = document.createElement("tr");

            if (i === 0) {
                const nameCell = document.createElement("td");
                nameCell.textContent = person.nazwisko_i_imie;
                nameCell.rowSpan = entries.length;
                row.appendChild(nameCell);
            }

            const unitCell = document.createElement("td");
            const unitLink = document.createElement("a");

            unitLink.href = "#";
            unitLink.textContent = record.nazwa_jednostki || "";

            unitLink.addEventListener("click", (event) => {
                event.preventDefault();
                searchUnit(record.nazwa_jednostki);
            });
            unitCell.appendChild(unitLink);

            const departmentCell = document.createElement("td");
            const departmentLink = document.createElement("a");

            departmentLink.href = "#";
            departmentLink.textContent = record.nazwa_komorki || "";

            departmentLink.addEventListener("click", (event) => {
                event.preventDefault();
                searchDepartment(record.nazwa_komorki);
            });
            departmentCell.appendChild(departmentLink);

            const positionCell = document.createElement("td");
            positionCell.textContent = record.stanowisko || "";

            const roomCell = document.createElement("td");
            const roomLink = document.createElement("a");
            roomLink.href = "#";
            roomLink.textContent = record.pokoj || "";
            roomLink.addEventListener("click", (event) => {
                event.preventDefault();
                searchRoom(record.pokoj);
            });
            roomCell.appendChild(roomLink);

            const phoneCell = document.createElement("td");
            phoneCell.textContent = record.telefon || "";

            row.append(
                unitCell,
                departmentCell,
                positionCell,
                roomCell,
                phoneCell
            );

            results.appendChild(row);
        }
    }
}