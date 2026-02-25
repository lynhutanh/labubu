const fs = require('fs');
const c = fs.readFileSync('src/app.module.ts', 'utf8');
const hasImport = c.includes("import { VoucherModule }");
console.log('Has VoucherModule import:', hasImport);
console.log('Has VoucherModule in array:', c.includes('VoucherModule,'));
// Show lines 20-35
const lines = c.split('\n');
lines.slice(20, 35).forEach((l, i) => console.log(i+21, l));
