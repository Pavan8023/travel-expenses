document.addEventListener("DOMContentLoaded", function () {
    const expenseChartCanvas = document.getElementById("expense-chart");
    const tripFilterSelect = document.getElementById("trip-filter");
    let expenseChart;

    // Load trips into the dropdown
    function loadTripFilterOptions() {
        let trips = JSON.parse(localStorage.getItem("trips")) || [];

        trips.forEach(trip => {
            let option = document.createElement("option");
            option.value = trip.name;  // Trip name as a unique identifier
            option.textContent = trip.name;
            tripFilterSelect.appendChild(option);
        });
    }

    // Get expenses based on selected trip
    function getExpensesData(selectedTrip) {
        const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

        const expenseCategories = { "Accommodation": 0, "Food": 0, "Transportation": 0 };

        expenses.forEach(expense => {
            if (selectedTrip === "all" || expense.trip === selectedTrip) { 
                let category = expense.category.trim();
                expenseCategories[category] = (expenseCategories[category] || 0) + parseFloat(expense.amount);
            }
        });

        return {
            labels: Object.keys(expenseCategories),
            data: Object.values(expenseCategories)
        };
    }

    // Render the bar chart dynamically
    function renderExpenseChart(selectedTrip = "all") {
        const { labels, data } = getExpensesData(selectedTrip);

        if (expenseChart) {
            expenseChart.destroy(); // Destroy existing chart before rendering new one
        }

        expenseChart = new Chart(expenseChartCanvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: `Expense Distribution (₹) - ${selectedTrip === "all" ? "All Trips" : selectedTrip}`,
                    data: data,
                    backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"],
                    borderColor: ["#ff6384", "#36a2eb", "#ffce56"],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "top"
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Load trips and initialize chart
    loadTripFilterOptions();
    renderExpenseChart();

    // Event Listener: Update chart on trip selection
    tripFilterSelect.addEventListener("change", function () {
        renderExpenseChart(tripFilterSelect.value);
    });

    // Ensure the chart updates after adding an expense
    document.getElementById("expense-form").addEventListener("submit", function (event) {
        event.preventDefault();
        
        const amount = parseFloat(document.getElementById("expense-amount").value);
        const selectedTrip = tripFilterSelect.value;

        if (!selectedTrip || selectedTrip === "all") {
            alert("Please select a trip before adding an expense.");
            return;
        }

        let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
        
        const expense = {
            category: document.getElementById("expense-category").value,
            amount: amount,
            date: document.getElementById("expense-date").value,
            trip: selectedTrip
        };

        expenses.push(expense);
        localStorage.setItem("expenses", JSON.stringify(expenses));

        // Refresh table and chart dynamically
        renderExpenseTable();
        renderExpenseChart(tripFilterSelect.value);
        document.getElementById("expense-form").reset();
    });

    // Function to delete an expense
    window.deleteExpense = function (index) {
        let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
        
        // Remove the selected expense from the array
        expenses.splice(index, 1);
    
        // Update localStorage
        localStorage.setItem("expenses", JSON.stringify(expenses));
    
        // Refresh the expense table dynamically
        renderExpenseTable();
    
        // Refresh the chart dynamically
        renderExpenseChart(tripFilterSelect.value);
    };

    // Function to render the expense table
    function renderExpenseTable() {
        const expenseList = document.getElementById("expense-list");
        expenseList.innerHTML = "";  // Clear current table content
    
        let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    
        expenses.forEach((expense, index) => {
            let row = document.createElement("tr");
    
            row.innerHTML = `
                <td>${expense.category}</td>
                <td>₹${expense.amount}</td>
                <td>${expense.date}</td>
                <td>
                    <button onclick="deleteExpense(${index})" class="delete-btn">❌</button>
                </td>
            `;
    
            expenseList.appendChild(row);
        });
    }

    // Load table data initially
    renderExpenseTable();
});


document.getElementById("generate-pdf").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Capture dashboard content
    html2canvas(document.querySelector("main")).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        doc.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
        doc.save("Travel_Expense_Report.pdf");
    });
});

