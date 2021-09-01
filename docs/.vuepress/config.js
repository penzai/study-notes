module.exports = {
  title: "Study Note",
  description: "学无止境",
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { 
        text: 'JavaScript',
        items: [
          { text: '基础', link: '/js/README.md' },
          { text: 'TypeScript', link: '/js/ts' },
          { text: 'React', link: '/js/react' }
        ]
      }
    ],
    sidebar: 'auto'
  },
  configureWebpack: {
    resolve: {
      alias: {
        'images': '../images',
      }
    }
  }
};
