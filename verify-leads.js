const http = require('http');

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/leads',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', () => { }); // Consume data
    res.on('end', () => console.log('Response received'));
});

req.on('error', (error) => {
    console.error(error);
});

req.end();
