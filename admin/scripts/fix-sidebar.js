const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
c = c.replace('  MessageCircle,\n} from "lucide-react";', '  MessageCircle,\n  Ticket,\n} from "lucide-react";');
c = c.replace('  MessageCircle,\n}from "lucide-react";', '  MessageCircle,\n  Ticket,\n}from "lucide-react";');
fs.writeFileSync('src/components/layout/Sidebar.tsx', c);
console.log('done');
