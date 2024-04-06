const path = require('path');
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

var packageDefinition = protoLoader.loadSync(path.join(__dirname, './customers.proto'));

const CustomerService = grpc.loadPackageDefinition(packageDefinition).CustomerService;
const client = new CustomerService(
    "localhost:30043",
    grpc.credentials.createInsecure()
);

app.get("/customers", (req, res) => {
    client.GetAll(null, (err, data) => {
        if (!err) {
            res.json(data.customers);
        }
    });
});

app.post("/customer", (req, res) => {
    const newCustomer = req.body;
    client.Insert(newCustomer, (err, data) => {
        if (err) throw err;
        console.log("Customer created successfully", data);
        res.json(data);
    });
});

app.put("/customers/:id", (req, res) => {
    const id = req.params.id;
    const updateCustomer = req.body;
    updateCustomer.id = id;
    client.Update(updateCustomer, (err, data) => {
        if (err) throw err;
        console.log("Customer updated successfully", data);
        res.json(data);
    });
});

app.delete("/customers/:id", (req, res) => {
    const id = req.params.id;
    client.Remove({ id: id }, (err, _) => {
        if (err) throw err;
        console.log("Customer removed successfully");
        res.sendStatus(204);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running at port %d", PORT);
});
