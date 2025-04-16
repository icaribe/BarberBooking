const fs = require('fs');

// Ler o arquivo
const filePath = './client/src/pages/admin/AdminDashboardPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Substituir os formatadores de Tooltip problemáticos
content = content.replace(
  /<Tooltip formatter=\{\(value\) => `R\$ \$\{\(value\/100\)\.toFixed\(2\)\}`\} \/>/g,
  '<Tooltip formatter={currencyFormatter} />'
);

// Gravar de volta no arquivo
fs.writeFileSync(filePath, content, 'utf8');
console.log('Tooltips substituídos com sucesso!');
