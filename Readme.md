# 图片自动上传cdn并替换原地址

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
1. 建议只在线上环境使用，在开发环境不应上传图片

## TODO
1. ~~打印上传进度~~
2. 上传失败重试
3. ~~删除图片或文件名变化时，怎么才能避免json因无用数据越来越大（脏数据检测）~~