# 图片自动上传 cdn 并替换原地址
开发过程中，图片太多手动上传到cdn过于繁琐。使用此工具不需要手动上传

## 安装
npm install img-upload-loader --save-dev

## 使用方法

webpack.config.js

```javascript
...
module: {
  rules: [
  ...,
    {
      test: /\.(png|jpe?g|gif)(\?.*)?$/,
        use: [
          process.env.NODE_ENV !== 'development' ? {
              loader: 'img-upload-loader',
              options: {
                // 上传的地址
                url: 'path-to-upload',
                cachePath: path.resolve(__dirname, '../../dist/prod')
              }
            }: {
              loader: 'url-loader',
              options: {
                limit: 1000,
                name: utils.assetsPath('img/[name].[hash:7].[ext]'),
              },
            },
          ],
        },
        ...
      ]
...
```

## 注意事项

1. 此工具仅在线上环境或测试环境使用，不要在开发环境使用，否则会上传很多无用图片到服务器上。

## TODO

1. ~~打印上传进度~~
2. ~~上传失败重试~~
3. ~~删除图片或文件名变化时，怎么才能避免 json 因无用数据越来越大（脏数据检测）~~
