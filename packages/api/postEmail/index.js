require ('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');

async function main(args) {
    const DB_CERT = process.env['CA_CERT'].replace(/\\n/g, '\n');
    const DATABASE_URL = process.env['DATABASE_URL'];
    const uri = DATABASE_URL

    const tlsCAFilePath = path.resolve(__dirname, 'certificate.pem');
    fs.writeFileSync(tlsCAFilePath, DB_CERT, { encoding: 'utf8' });

    let client = new MongoClient(uri, {
        tls: true,
        tlsCAFile: tlsCAFilePath,
        tlsInsecure: true
    });

    let newEmail = args.email;
    try {
        await client.connect();
        await client.db("do-coffee").collection("email-list").insertOne({subscriber: newEmail});
        console.log(`added ${newEmail} to database.`);
    } catch {
        console.error();
        return {
            "error": "There was a problem adding the email address to the database"
        }
    } finally {
        await client.close();
    }
}

module.exports.main = main;
