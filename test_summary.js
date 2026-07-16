const fetch = require('node-fetch'); // node-fetch might not be available. I'll use http
const http = require('http');

const loginData = JSON.stringify({ email: 'demo@ulima.edu.pe', password: 'Demo1234' });

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const data = JSON.parse(body);
    const token = data.data.token;
    
    // now fetch summary
    http.get({
      hostname: 'localhost',
      port: 3000,
      path: '/api/home/summary?lat=null&lng=null',
      headers: { 'Authorization': 'Bearer ' + token }
    }, res2 => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => {
        console.log('STATUS:', res2.statusCode);
        console.log('SUMMARY:', body2);
      });
    });
  });
});

req.write(loginData);
req.end();
