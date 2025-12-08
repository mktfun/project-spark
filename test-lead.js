const https = require('http');

const data = JSON.stringify({
    nome: "Cliente Teste Silva",
    telefone: "5511999999999",
    email: "teste@email.com",
    tipo_seguro: "AUTO",
    dados_extras: { modelo: "Honda Civic", ano: 2021, placa: "ABC-1234" },
    resumo: "Cliente quer renovar seguro auto, vence em 10 dias."
});

const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/leads',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => console.log('BODY:', body));
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
