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

    const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
    );

    const data = await response.json();


    results.innerHTML = "";
    resultsTable.classList.remove("d-none");

    if (data.count === 0) {
    resultsInfo.textContent = "Nie znaleziono wyników.";
    return;
    }

    resultsInfo.textContent =
        `Znaleziono: ${data.count}`;


    for (const record of data.results) {

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = record.nazwisko_i_imie;

        const unitCell = document.createElement("td");
        unitCell.textContent = record.nazwa_jednostki;

        const departmentCell = document.createElement("td");
        departmentCell.textContent = record.nazwa_komorki;

        const positionCell = document.createElement("td");
        positionCell.textContent = record.stanowisko;

        const roomCell = document.createElement("td");
        roomCell.textContent = record.pokoj;

        const phoneCell = document.createElement("td");
        phoneCell.textContent = record.telefon;


        row.append(
            nameCell,
            unitCell,
            departmentCell,
            positionCell,
            roomCell,
            phoneCell
        );


        results.appendChild(row);
    }

});