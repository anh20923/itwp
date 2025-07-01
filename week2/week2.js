// Task 2, 4, 5
let submitButton = document.getElementById("submit-data");
submitButton.addEventListener("click", function (event) {
    event.preventDefault();

    // Get user input
    let userName = document.getElementById("input-username").value;
    let email = document.getElementById("input-email").value;
    let isAdmin = document.getElementById("input-admin").checked ? "X" : "-";
    let imageInput = document.getElementById("input-image");
    let imageFile = imageInput.files[0];

    // Get table rows
    let dataTable = document.querySelector("#data-table tbody");
    let rows = dataTable.querySelectorAll("tr");

    let userExists = false;

    // Check if user already exists and update
    rows.forEach(row => {
        if (row.cells[0].textContent === userName) {
            row.cells[1].textContent = email;
            row.cells[2].textContent = isAdmin;

            // Chỉ cập nhật ảnh nếu có file mới
            if (imageFile && row.cells[3]) {
                let img = row.cells[3].querySelector("img");
                if (img) {
                    img.src = URL.createObjectURL(imageFile);
                }
            }

            userExists = true;
        }
    });

    // If user doesn't exist, create new row
    if (!userExists) {
        let newRow = document.createElement("tr");

        let newUserName = document.createElement("td");
        newUserName.innerHTML = userName;

        let newEmail = document.createElement("td");
        newEmail.innerHTML = email;

        let newAdmin = document.createElement("td");
        newAdmin.innerHTML = isAdmin;

        newRow.appendChild(newUserName);
        newRow.appendChild(newEmail);
        newRow.appendChild(newAdmin);

        // Chỉ thêm ảnh nếu có chọn file
        if (imageFile) {
            let imageCell = document.createElement("td");
            let img = document.createElement("img");
            img.width = 64;
            img.height = 64;
            img.src = URL.createObjectURL(imageFile);
            imageCell.appendChild(img);
            newRow.appendChild(imageCell);
        }

        dataTable.appendChild(newRow);
    }

    // Reset form
    document.getElementById("input-username").value = "";
    document.getElementById("input-email").value = "";
    document.getElementById("input-admin").checked = false;
    document.getElementById("input-image").value = "";
});

// Task 3: Empty the table
let emptyButton = document.getElementById("empty-table");
emptyButton.addEventListener("click", function () {
    let dataTable = document.querySelector("#data-table tbody");
    dataTable.innerHTML = "";
});
