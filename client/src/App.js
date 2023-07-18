import "./App.css";
import { useState, useEffect } from "react";
import Axios from "axios";

function App() {
  const [invoice_number, setInvoiceNumber] = useState(0);
  const [invoice_date, setInvoiceDate] = useState("");
  const [invoice_amount, setInvoiceAmount] = useState(0);

  const [newInvoiceNumber, setNewInvoiceNumber] = useState(0);
  const [newInvoiceDate, setNewInvoiceDate] = useState("");

  const [employeeList, setEmployeeList] = useState([]);

  const [financialYears] = useState([
    { start: '2022-04-01', end: '2023-03-31' },
    { start: '2023-04-01', end: '2024-03-31' },
    { start: '2024-04-01', end: '2025-03-31' },
    // Add more financial years as needed
  ]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(null);


  useEffect(() => {
    getEmployees();
  });

  const addEmployee = () => {
    const formattedDate = new Date(invoice_date).toISOString().split("T")[0];

  const existingEmployee = employeeList.find(
    (employee) =>
      employee.invoice_number === invoice_number &&
      employee.invoice_date === formattedDate
  );

    if (existingEmployee) {
      alert("Same invoice_number should not be added in same financial-year");
      return;
    }

    Axios.post("http://localhost:3001/create", {
      invoice_number: invoice_number,
      invoice_date: formattedDate,
      invoice_amount: invoice_amount,
    })
      .then(() => {
        const newEmployee = {
          invoice_number: invoice_number,
          invoice_date: invoice_date,
          invoice_amount: invoice_amount,
        };
        setEmployeeList([...employeeList, newEmployee]);
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          alert("An employee with the same invoice number and date already exists.");
        } else {
          alert("An error occurred while adding the employee.");
        }
      });
  };

  const getEmployees = () => {
    let queryParams = {};
  
    if (selectedFinancialYear !== null) {
      const financialYear = financialYears[selectedFinancialYear];
      queryParams.financialYearStart = financialYear.start;
      queryParams.financialYearEnd = financialYear.end;
    }
  
    Axios.get("http://localhost:3001/invoices", { params: queryParams })
      .then((response) => {
        setEmployeeList(response.data);
      })
      .catch((error) => {
        console.log(error);
        // Handle error
      });
  };
  

  const updateEmployeeWage = (id) => {
    Axios.put("http://localhost:3001/update", {
      invoice_number: newInvoiceNumber !== 0 ? newInvoiceNumber : undefined,
      invoice_date: newInvoiceDate !== "" ? newInvoiceDate : undefined,
    }).then((response) => {
      setEmployeeList(
        employeeList.map((val) => {
          return val.invoice_number === id
            ? {
                invoice_number: newInvoiceNumber !== 0 ? newInvoiceNumber : val.invoice_number,
                invoice_date: newInvoiceDate !== "" ? newInvoiceDate : val.invoice_date,
                invoice_amount: val.invoice_amount,
              }
            : val;
        })
      );
    });
  };

  const deleteEmployee = (invoice_number) => {
    Axios.delete(`http://localhost:3001/invoices/${invoice_number}`).then((response) => {
      setEmployeeList(
        employeeList.filter((val) => {
          return val.invoice_number !== invoice_number;
        })
      );
    });
  };

  return (
    <div className="App">
      <div className="information">
        <label className="labelInput">Invoice_Number:</label>
        <input
          className="inputOne"
          type="number"
          onChange={(event) => {
            setInvoiceNumber(event.target.value);
          }}
        />
        <label className="labelInput">Invoice_Date:</label>
        <input
          className="inputOne"
          type="date"
          onChange={(event) => {
            setInvoiceDate(event.target.value);
          }}
        />
        <label className="labelInput">Invoice_Amount:</label>
        <input
          className="inputOne"
          type="number"
          onChange={(event) => {
            setInvoiceAmount(event.target.value);
          }}
        />

        <button className="buttonOne" style={{ backgroundColor: "green" }} onClick={addEmployee}>
          Add
        </button>
        <button className="buttonOne" style={{ backgroundColor: "red" }} onClick={getEmployees}>
          Show
        </button>
        <label>Select Financial Year:</label>
      <select
        value={selectedFinancialYear}
        onChange={(event) => setSelectedFinancialYear(event.target.value)}
      >
        <option value="">All</option>
        {financialYears.map((year, index) => (
          <option key={index} value={index}>
            {`${year.start} - ${year.end}`}
          </option>
        ))}
      </select>
      </div>
      <div className="employees">
        {employeeList.length > 0 && (
          <div className="invoiceDetails">
            <button className="in">
              <h1 className="inH1">Invoice_Number</h1>
            </button>
            <button className="in">
              <h1 className="inH1">Invoice_Date</h1>
            </button>
            <button className="in">
              <h1 className="inH1">Invoice_Number</h1>
            </button>
          </div>
        )}
        {employeeList.map((val, key) => {
          return (
            <div className="onein" key={key}>
              <div className="mar">
              <div className="invoiceDetails">
                <button className="in">
                  <h3 className="inH1">{val.invoice_number}</h3>
                </button>
                <button className="in">
                  <h3 type="date" className="inH1">
                    {new Date(val.invoice_date).toLocaleDateString()}
                  </h3>
                </button>
                <button className="in">
                  <h3 className="inH1">{val.invoice_amount}</h3>
                </button>
                </div>
                </div>
              <div className="can">
                <input
                className="line"
                  type="text"
                  placeholder="number"
                  onChange={(event) => {
                    setNewInvoiceNumber(event.target.value);
                  }}
                />
                <input
                className="line"
                  type="text"
                  placeholder="date"
                  onChange={(event) => {
                    setNewInvoiceDate(event.target.value);
                  }}
                />
                <button
                className="bu"
                style={{backgroundColor:"green"}}
                  onClick={() => {
                    updateEmployeeWage(val.invoice_number);
                  }}
                >
                  Update
                </button>

                <button
                className="bu"
                style={{backgroundColor:"red"}}
                  onClick={() => {
                    deleteEmployee(val.invoice_number);
                  }}
                >
                  Delete
                </button>
                </div>
              </div>
            
          );
        })}
      </div>
    </div>
  );
}

export default App;