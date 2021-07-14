const fs = require('fs');
const crypto = require('crypto');

module.exports.createFile = (name, defaultValue = {}) => {
  const dataDir = './data';
  if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
  }
  const filePath = `${dataDir}/${name}`;
  if (!fs.existsSync(filePath)){
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 4), (erros) => {
      console.warn(erros);
    });
  }
  return filePath;
}

module.exports.getFormatedDateTime = (date) => {
  return `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

module.exports.createHash = () => {
  const date = new Date();
  const hash = crypto
    .createHash('md5') 
    .update(date.getTime().toString())
    .digest('hex');
  // console.log(hash); // para saber a hash a colocar no pedido, depois tem que se remover
  return hash;
}
