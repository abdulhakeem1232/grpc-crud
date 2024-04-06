const path = require('path')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(path.join(__dirname, 'customers.proto'))
const customerProto = grpc.loadPackageDefinition(packageDefinition);

let Customers = [
    {
        id: '1',
        name: 'Hakeem',
        email: 'hakeem@gmail.com',
        address: 'kasargod'
    },
    {
        id: '2',
        name: 'suhail',
        email: 'suhail@gmail.com',
        address: 'kannur'
    },
    {
        id: '3',
        name: 'Hudhyfa',
        email: 'hudhyfa@gmail.com',
        address: 'Trivandrum'
    }
]

const server = new grpc.Server()

function createUser(call, callback) {
    const user = call.request;
    user.id = (Customers.length + 1).toString();
    Customers.push(user);
    callback(null, user);
}

function getUser(call, callback) {
    let user = Customers.find(u => u.id == call.request.id)

    if (user) {
        callback(null, user)
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "Not found"
        });
    }
}

function getAll(call, callback) {
    console.log('lll');
    const customerList = {
        customers: Customers
    };
    callback(null, customerList);
}

function updateUser(call, callback) {
    let existingCustomer = Customers.find(n => n.id == call.request.id);

    if (existingCustomer) {
        existingCustomer.name = call.request.name;
        existingCustomer.email = call.request.email;
        existingCustomer.address = call.request.address;
        callback(null, existingCustomer);
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "Not found"
        });
    }
}

function deleteUser(call, callback) {
    let existingCustomerIndex = Customers.findIndex(
        n => n.id == call.request.id
    );
    if (existingCustomerIndex != -1) {
        Customers.splice(existingCustomerIndex, 1);
        callback(null, {});
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "Not found"
        });
    }
}

server.addService(customerProto.CustomerService.service, {
    Insert: createUser,
    Get: getUser,
    Update: updateUser,
    Remove: deleteUser,
    GetAll: getAll
});

server.bindAsync("127.0.0.1:30043", grpc.ServerCredentials.createInsecure(), () => {
    console.log("Server running at http://127.0.0.1:30043");
    server.start();
});