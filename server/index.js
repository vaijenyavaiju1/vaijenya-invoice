var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var db = require("./database");

app.use(bodyParser.json());
app.use(cors());


app.post("/create", (req, res) => {
  const invoice_number = parseInt(req.body.invoice_number); // Parse invoice_number as a number
  const invoice_date = new Date(req.body.invoice_date); // Convert invoice_date to a date object
  const invoice_amount = req.body.invoice_amount;

  const financialYear = getFinancialYear(invoice_date);

  db.query(
    "SELECT * FROM crud WHERE invoice_number = ? AND invoice_date >= ? AND invoice_date <= ?",
    [invoice_number, financialYear.start, financialYear.end],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred while inserting the data.");
      } else {
        if (result.length > 0) {
          res.status(400).send("An employee with the same invoice number already exists within the financial year.");
        } else {
          db.query(
            "INSERT INTO crud (invoice_number, invoice_date, invoice_amount) VALUES (?,?,?)",
            [invoice_number, invoice_date, invoice_amount],
            (err, result) => {
              if (err) {
                console.log(err);
                res.status(500).send("An error occurred while inserting the data.");
              } else {
                res.send("Values Inserted");
              }
            }
          );
        }
      }
    }
  );
});

        





function getFinancialYear(date) {
  const year = new Date(date).getFullYear();
  const financialYearStart = new Date(`${year}-04-01`);
  const financialYearEnd = new Date(`${year + 1}-03-31`);

  return { start: financialYearStart, end: financialYearEnd };
}




app.get("/invoices", (req, res) => {
  const { invoice_number, invoice_date, financialYearStart, financialYearEnd } = req.query;

  let query = "SELECT * FROM crud";
  let params = [];

  if (invoice_number && invoice_date) {
    query += " WHERE invoice_number = ? AND invoice_date = ?";
    params = [invoice_number, invoice_date];
  } else if (financialYearStart && financialYearEnd) {
    query += " WHERE invoice_date >= ? AND invoice_date <= ?";
    params = [financialYearStart, financialYearEnd];
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred while fetching the data.");
    } else {
      res.send(result);
    }
  });
});





app.put("/update", (req, res) => {
  const invoice_number = req.body.invoice_number;
  const invoice_date = req.body.invoice_date;

  db.query(
    "UPDATE crud SET invoice_number = ? WHERE invoice_date = ?",
    [invoice_number, invoice_date],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred while updating the data.");
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/invoices/:invoice_number", (req, res) => {
  const invoice_number = req.params.invoice_number;
  db.query("DELETE FROM crud WHERE invoice_number = ?", invoice_number, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred while deleting the data.");
    } else {
      res.send(result);
    }
  });
});

app.listen(3001, function () {
  console.log("App Listening on port 3001");
  db.connect(function (err) {
    if (err) throw err;
    console.log("Database connected!");
  });
});
