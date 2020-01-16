const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { argv } = require('yargs');
const moment = require('moment');

// 国际化id
const serviceCode = argv.service || 'campus-proxy-front';
const environment = argv.env || 'DEV';
const downloadLocalesApi = `http://10.17.9.14:8080/version/search?serviceCode=${serviceCode}&environment=${environment}`;

// 请求数据
const downData = () =>
  new Promise((resolve, reject) => {
    const myURL = new URL(downloadLocalesApi);
    const protocol = myURL.protocol === 'https:' ? https : http;
    console.log('==开始下载版本信息==');
    const req = protocol.get(downloadLocalesApi, res => {
      let data = '';
      res.setEncoding('utf-8');
      res.on('data', chunk => {
        data = `${data}${chunk}`;
      });
      res.on('end', () => {
        console.log('==下载成功==');
        resolve(data);
      });
    });

    req.on('error', e => {
      console.log('==下载失败==');
      reject(e);
    });

    req.end();
  });

// 生成js文件到public中
const writeFile = data =>
  new Promise((resolve, reject) => {
    const result = JSON.parse(data);
    result.version = `${result.currentVersionPrefixText}.${result.lastSequence}`;
    result.updateTime = moment().format('YYYY/MM/DD hh:mm:ss');

    console.log('==开始写入version.json==');
    fs.writeFile(
      path.join(__dirname, '../public/version.json'),
      JSON.stringify(result, null, 2),
      err => {
        if (err) {
          console.log('==写入文件失败==');
          reject(err);
        }
        console.log('==写入文件成功==');
        resolve(err);
      }
    );
  });

const init = async () => {
  try {
    const data = await downData();
    await writeFile(data);
  } catch (e) {
    console.error('下载字体库失败', e);
    process.exit();
  }
};

init();
