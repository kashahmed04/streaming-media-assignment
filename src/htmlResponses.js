// hosting large files such as videos or audio can be too memory
// intensive for the server and browser so we need to stream the
// larger files in order to keep memory low and processing efficent
// streaming is sending the data in pieces rather than all at once

//do we need only one to access multiple pages or different ones to access each page****
const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const index2 = fs.readFileSync(`${__dirname}/../client/client2.html`);
const index3 = fs.readFileSync(`${__dirname}/../client/client3.html`);

// for now we are using synchronous functions (page waits until this is done
// executing then moves on)** for small static files**
// but for our larger files we will not be able to

// the request and response objects come from the onRequest function in server.js
// and we pass them into getIndex
const getIndex = (request, response) => {
  // writeHead function allows us to write a status code and a JSON object
  // of the headers** to send back
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

//do we need these**
const getPage2 = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(index2);
    response.end();

};

const getPage3 = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(index3);
    response.end();

};

module.exports.getIndex = getIndex;
module.exports.getPage2 = getPage2;
module.exports.getPage3 = getPage3;
