const bcrypt = require('bcryptjs');
const fs = require('fs');

const password = 'password1';
const hash = '$2y$05$yo36YmqhMPYyJrIv4sDVu.1En9e1I1Ry6X8g2YVtLCpJT8nN3pUde';

console.log('Testing bcryptjs...');
bcrypt.compare(password, hash, (err, res) => {
    if (err) console.error('Error:', err);
    console.log('Match:', res);
});
