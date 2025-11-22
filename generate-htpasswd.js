const bcrypt = require('bcryptjs');
const fs = require('fs');

const users = [
    { username: 'user1@email.com', password: 'password1' },
    { username: 'user2@email.com', password: 'password1' }
];

console.log('Generating .htpasswd...');
const lines = users.map(u => {
    const hash = bcrypt.hashSync(u.password, 10);
    return `${u.username}:${hash}`;
});

fs.writeFileSync('tests/.htpasswd', lines.join('\n'));
console.log('Done.');
