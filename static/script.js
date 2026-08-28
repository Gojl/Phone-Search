const form = document.querySelector("#searchForm");
const input = document.querySelector("#searchInput");
const results = document.querySelector("#results");
const resultsInfo = document.querySelector("#resultsInfo");
const resultsTable = document.querySelector("#resultsTable");
const pagination = document.querySelector("#pagination");
const filterList = document.querySelector("#filterList");
const showAllButton = document.querySelector("#showAllButton");
const showUnitsButton = document.querySelector("#showUnitsButton");
const showDepartmentsButton = document.querySelector("#showDepartmentsButton");
const showPositionsButton = document.querySelector("#showPositionsButton");
const showRoomsButton = document.querySelector("#showRoomsButton");

let currentResults = [];
let currentPage = 1;
const resultsPerPage = 25;
const filtersPerPage = 15;
let currentFilterItems = [];
let currentFilterType = "";
let currentFilterPage = 1;

async function search(query) {
    const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    displayResults(data);
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = input.value.trim();

    if (!query) {
        return;
    }

    await search(query);
});

showAllButton.addEventListener("click", async () => {
    filterList.innerHTML = "";
    input.value = "";
    await search("");
});

showUnitsButton.addEventListener("click", async () => {
    const data = await loadFilters();
    showFilterList(data.units, "unit");
});

showDepartmentsButton.addEventListener("click", async () => {
    const data = await loadFilters();
    showFilterList(data.departments, "department");
});

showPositionsButton.addEventListener("click", async () => {
    const data = await loadFilters();
    showFilterList(data.positions, "position");
});

showRoomsButton.addEventListener("click", async () => {
    const data = await loadFilters();
    showFilterList(data.rooms, "room");
});

async function loadFilters() {
    const response = await fetch("/api/filters");
    const data = await response.json();
    return data;
}

async function searchPosition(position) {
    input.value = position;
    const response = await fetch(
        `/api/search?position=${encodeURIComponent(position)}`
    );
    const data = await response.json();
    displayResults(data);
}

function showFilterList(items, type) {
    resultsTable.classList.add("d-none");
    resultsInfo.textContent = "";
    pagination.innerHTML = "";
    currentFilterItems = items;
    currentFilterType = type;
    currentFilterPage = 1;
    renderFilterPage();
}

function renderFilterPage() {
    filterList.innerHTML = "";
    pagination.innerHTML = "";
    const start = (currentFilterPage - 1) * filtersPerPage;
    const end = start + filtersPerPage;
    const pageItems = currentFilterItems.slice(start, end);
    const list = document.createElement("div");
    list.classList.add("list-group");

    for (const item of pageItems) {
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add(
            "list-group-item",
            "list-group-item-action"
        );

        button.textContent = item;
        button.addEventListener("click", () => {
            filterList.innerHTML = "";

            if (currentFilterType === "unit") {
                searchUnit(item);
            } else if (currentFilterType === "department") {
                searchDepartment(item);
            } else if (currentFilterType === "position") {
                searchPosition(item);
            } else if (currentFilterType === "room") {
                searchRoom(item);
            }
        });
        list.appendChild(button);
    }
    filterList.appendChild(list);
    renderFilterPagination();
}

function renderFilterPagination() {
    pagination.innerHTML = "";
    const totalPages = Math.ceil(
        currentFilterItems.length / filtersPerPage
    );
    if (totalPages <= 1) {
        return;
    }
    addFilterPaginationButton(
        "‹",
        currentFilterPage - 1,
        currentFilterPage === 1
    );
    addFilterPaginationButton(
        "1",
        1,
        currentFilterPage === 1
    );
    if (currentFilterPage > 3) {
        addFilterDots();
    }
    const startPage = Math.max(
        2,
        currentFilterPage - 1
    );
    const endPage = Math.min(
        totalPages - 1,
        currentFilterPage + 1
    );
    for (let page = startPage; page <= endPage; page++) {
        addFilterPaginationButton(
            page,
            page,
            page === currentFilterPage
        );
    }
    if (currentFilterPage < totalPages - 2) {
        addFilterDots();
    }
    if (totalPages > 1) {
        addFilterPaginationButton(
            totalPages,
            totalPages,
            currentFilterPage === totalPages
        );
    }
    addFilterPaginationButton(
        "›",
        currentFilterPage + 1,
        currentFilterPage === totalPages
    );
}

function addFilterPaginationButton(text, page, disabled = false) {
    const li = document.createElement("li");
    li.classList.add("page-item");

    if (disabled) {
        li.classList.add("disabled");
    }

    if (page === currentFilterPage) {
        li.classList.add("active");
    }

    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("page-link");
    button.textContent = text;

    if (!disabled) {
        button.addEventListener("click", () => {
            currentFilterPage = page;
            renderFilterPage();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    li.appendChild(button);
    pagination.appendChild(li);
}

function addFilterDots() {
    const li = document.createElement("li");
    li.classList.add("page-item", "disabled");
    const span = document.createElement("span");
    span.classList.add("page-link");
    span.textContent = "...";
    li.appendChild(span);
    pagination.appendChild(li);
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
    pagination.innerHTML = "";
    filterList.innerHTML = "";
    if (data.count === 0) {
        resultsInfo.textContent = "Nie znaleziono wyników.";
        resultsTable.classList.add("d-none");
        return;
    }

    resultsTable.classList.remove("d-none");

    resultsInfo.textContent = `Znaleziono: ${data.count}`;

    currentResults = data.results;
    currentPage = 1;

    renderPage();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function renderPage() {
    results.innerHTML = "";

    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;

    const pageResults = currentResults.slice(start, end);

    for (const person of pageResults) {
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
            unitLink.classList.add("text-dark");
            unitLink.textContent = record.nazwa_jednostki || "";

            unitLink.addEventListener("click", (event) => {
                event.preventDefault();
                searchUnit(record.nazwa_jednostki);
            });

            unitCell.appendChild(unitLink);

            const departmentCell = document.createElement("td");
            const departmentLink = document.createElement("a");

            departmentLink.href = "#";
            departmentLink.classList.add("text-dark");
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
            roomLink.classList.add("text-dark");
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

    renderPagination();
}

function renderPagination() {
    pagination.innerHTML = "";

    const totalPages = Math.ceil(
        currentResults.length / resultsPerPage
    );

    if (totalPages <= 1) {
        return;
    }

    addPaginationButton(
        "‹",
        currentPage - 1,
        currentPage === 1
    );

    addPaginationButton(
        "1",
        1,
        currentPage === 1
    );

    if (currentPage > 3) {
        addDots();
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let page = startPage; page <= endPage; page++) {
        addPaginationButton(
            page,
            page,
            page === currentPage
        );
    }

    if (currentPage < totalPages - 2) {
        addDots();
    }

    if (totalPages > 1) {
        addPaginationButton(
            totalPages,
            totalPages,
            currentPage === totalPages
        );
    }

    addPaginationButton(
        "›",
        currentPage + 1,
        currentPage === totalPages
    );
}

function addPaginationButton(text, page, disabled = false) {
    const li = document.createElement("li");
    li.classList.add("page-item");

    if (disabled) {
        li.classList.add("disabled");
    }

    if (page === currentPage) {
        li.classList.add("active");
    }

    const button = document.createElement("button");
    button.classList.add("page-link");
    button.textContent = text;
    button.type = "button";

    if (!disabled) {
        button.addEventListener("click", () => {
            currentPage = page;
            renderPage();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    li.appendChild(button);
    pagination.appendChild(li);
}

function addDots() {
    const li = document.createElement("li");
    li.classList.add("page-item", "disabled");

    const span = document.createElement("span");
    span.classList.add("page-link");
    span.textContent = "...";

    li.appendChild(span);
    pagination.appendChild(li);
}
