// The function's dependencies.
require ('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');

// Function starts here.
async function main() {

// Locates the database cluster's CA cert environment variable, writes it to a .pem file and provides the file's location to the MongoDB client.

    const DB_CERT = process.env['CA_CERT'].replace(/\\n/g, '\n');
    const DATABASE_URL = process.env['DATABASE_URL'];
    const uri = DATABASE_URL
    const tlsCAFilePath = path.resolve(__dirname, 'certificate.pem');
    fs.writeFileSync(tlsCAFilePath, DB_CERT, { encoding: 'utf8' });

// MongoDB client configuration.
    let client = new MongoClient(uri, {
        tls: true,
        tlsCAFile: tlsCAFilePath,
        tlsInsecure: true
    });

// Instantiates a connection to the database and retrieves data from the `available-coffee` collection
    try {
        await client.connect();
        const inventory = await client.db("do-coffee").collection("available-coffees").find().toArray();
        console.log(inventory);
        return {
            "body": inventory
        }
    } catch {
        console.error();
        return {
            "error": "There was a problem retrieving data."
        }
    } finally {
        await client.close();
    }
}

// IMPORTANT: Makes the function available as a module in the project. This is required for any functions that require external dependencies.

module.exports.main = main;
