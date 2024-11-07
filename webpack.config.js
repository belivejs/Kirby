const path = require('path');

module.exports = {
  entry: './src/index.js', // 시작 파일
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development', // 개발 모드
  devServer: {
    static: './dist', // 파일을 서빙할 디렉토리
    open: true, // 서버 실행 시 브라우저를 자동으로 열기
    hot: true, // 핫 리로딩 활성화
  },
  module: {
    rules: [
      {
        test: /\.(gltf|glb)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'models/',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

