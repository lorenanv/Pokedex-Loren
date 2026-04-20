export function renderPagination(totalCount, currentPage, limit, loadPage) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(totalCount / limit);
    const blockSize = 3;

    if (totalPages <= 1) return;

    const createButton = (page, label = page) => {
        const btn = document.createElement("button");
        btn.textContent = label;

        if (page === currentPage) {
            btn.classList.add("active");
        }

        btn.addEventListener("click", () => loadPage(page));
        pagination.appendChild(btn);
    };

    const addDots = () => {
        const span = document.createElement("span");
        span.textContent = "...";
        pagination.appendChild(span);
    };

    const currentBlock = Math.floor((currentPage - 1) / blockSize);

    const startBlockPage = currentBlock * blockSize + 1;
    const endBlockPage = Math.min(startBlockPage + blockSize - 1, totalPages);

    if (startBlockPage > 1) {
        createButton(startBlockPage - 1, "‹");
    }

    createButton(1);

    if (startBlockPage > 2) addDots();

    for (let i = startBlockPage; i <= endBlockPage; i++) {
        if (i !== 1 && i !== totalPages) {
            createButton(i);
        }
    }

    if (endBlockPage < totalPages - 1) addDots();

    if (totalPages > 1) {
        createButton(totalPages);
    }

    if (endBlockPage < totalPages) {
        createButton(endBlockPage + 1, "›");
    }
}