import axios from 'axios';
import { getOptions } from 'loader-utils';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import ora from 'ora';

const cacheFileName = 'img-url-map.json';

interface Data {
  url: string;
}

// loader 入口
const imgUploadLoader = async function (source: Buffer): Promise<void> {
  // @ts-ignore
  const callback = this.async();
  // @ts-ignore
  const options = getOptions(this);
  // @ts-ignore
  const data = await Process(source, options, this);
  // @ts-ignore
  callback(null, `module.exports = '${data.url}'`);
};

// 上传
function upload(url: string, file: Buffer): Promise<Data> {
  return new Promise((res, rej) => {
    axios({
      method: 'POST',
      url: url,
      data: file,
      headers: {
        Accept:
          'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Content-Type': 'application/octet-stream',
        Connection: 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language':
          'zh-CN,zh;q=0.9,en;q=0.8,es-MX;q=0.7,es;q=0.6,tr;q=0.5,id;q=0.4,hi;q=0.3,en-US;q=0.2,th;q=0.1,ru;q=0.1,uz;q=0.1',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      },
    })
      .then((response) => {
        res(response.data);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

// 递归创建目录
function mkdirsSync(dirname: string) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

// 根据文件二进制生成md5
function genMd5(file: Buffer): string {
  const hash = crypto.createHash('md5');
  hash.update(file);
  const md5 = hash.digest('hex');
  return md5;
}

// 检查资源是否上传过，避免重复上传
function checkUrlMap(hash: string, cachePath: string, context: any): any {
  // 项目特殊性，需要读取dist里面的配置
  const filePath = cachePath;
  const key = context.resourcePath.replace(
    context.rootContext || context.options.context,
    '',
  );
  try {
    // 已有缓存的json文件
    const file = fs.readFileSync(path.join(filePath, cacheFileName), 'utf-8');
    const result = JSON.parse(file);
    return result[key] && result[key].hash === hash && result[key].url;
  } catch (err) {
    if (err.code === 'ENOENT') {
      // 无缓存文件，返回空
      return '';
    } else {
      throw err;
    }
  }
}

// 写入url-map，为下次编译缓存
function genUrlMap(hash: string, url: string, cachePath: string, context: any) {
  const filePath = cachePath;
  const key: string = context.resourcePath.replace(
    context.rootContext || context.options.context,
    '',
  );
  let result: any;
  try {
    const file = fs.readFileSync(path.join(filePath, cacheFileName), 'utf-8');
    result = JSON.parse(file);
    // 检查脏数据并删除
    Object.keys(result).forEach((item) => {
      if (
        !fs.existsSync(
          `${context.rootContext || context.options.context}${item}`,
        )
      ) {
        delete result[item];
      }
    });
    result[key] = {
      hash,
      url,
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      // 无文件，创建文件并写入
      mkdirsSync(filePath);
      result = {
        [key]: {
          hash,
          url,
        },
      };
    } else {
      throw err;
    }
  }
  const Str_ans = JSON.stringify(result, null, 4);
  fs.writeFileSync(path.join(filePath, cacheFileName), Str_ans, 'utf8');
}

async function Process(
  file: Buffer,
  options: any,
  context: any,
): Promise<Data | void> {
  const md5 = genMd5(file);
  const cachePath = options.cachePath
    ? options.cachePath
    : context.output.path.replace('__dist', 'dist');
  const url = checkUrlMap(md5, cachePath, context);
  const isUpload = !!url;
  if (!isUpload) {
    const key = context.resourcePath.replace(
      context.rootContext || context.rootContext || context.options.context,
      '',
    );
    const spinner = ora(`uploading images: ${key}`);
    spinner.start();
    try {
      const data = await upload(options.url, file);
      genUrlMap(md5, data.url, cachePath, context);
      spinner.succeed();
      return data;
    } catch (e) {
      if (e.code === 'ECONNRESET') {
        console.log('重试中', file);
        return await Process(file, options, context);
      }
    }
  } else {
    return {
      url,
    };
  }
}

imgUploadLoader.raw = true;
module.exports = imgUploadLoader;
