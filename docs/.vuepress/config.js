module.exports = {
  title: "Study Note",
  description: "学无止境",
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
    ],
    sidebar: [
      '/js/',
      '/css/',
      '/css-practice/',
      '/dac/',
      '/web/',
      '/git/',
      '/linux/',
      '/nginx/',
      '/node/',
      '/react/',
      '/vue/',
      '/write/',
    ]
  },
  configureWebpack: {
    resolve: {
      alias: {
        'images': '../images',
      }
    }
  }
};
