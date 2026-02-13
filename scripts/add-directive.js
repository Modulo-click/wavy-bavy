const fs = require('fs');
const path = require('path');

const files = [
    path.join(__dirname, '../dist/index.mjs'),
    path.join(__dirname, '../dist/index.js'),
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (!content.includes('"use client";')) {
            fs.writeFileSync(file, '"use client";\n' + content);
            console.log(`Added "use client" to ${file}`);
        }
    }
});
