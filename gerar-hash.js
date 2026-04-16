const bcrypt = require('bcrypt')

async function main() {
  const hash = await bcrypt.hash('sua_senha_aqui', 10)
  console.log(hash)
}

main()