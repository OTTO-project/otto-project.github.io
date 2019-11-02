module.exports = options => {
  const { mdx = true, contentPath = 'docs' } = options

  return {
    plugins: [
      'gatsby-plugin-meta-redirect',
      'gatsby-plugin-theme-ui',
      'gatsby-plugin-react-helmet',
      'gatsby-plugin-redirects',
      mdx && {
        resolve: 'gatsby-plugin-mdx',
        options: {
          extensions: ['.mdx', '.md'],
          remarkPlugins: [require('remark-slug'), require('remark-emoji')],
          gatsbyRemarkPlugins: [
            {
              resolve: `gatsby-remark-mermaid`,
              options: {
                language: "mermaid",
                theme: "neutral",
                viewport: {
                  width: 1200,
                  height: 1200
                },
                mermaidOptions: {
                  themeCSS: `* {
                                    font-size: 14px;
                                    stroke-width: 1px;
                                    margin: 0;
                                    padding: 0;
                                    font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
                                }`
                }
              }
            },
            {
              resolve: 'gatsby-remark-images',
              options: {
                maxWidth: 1035,
                sizeByPixelDensity: true,
              },
            },
          ],
        }
      },
      {
        resolve: 'gatsby-source-filesystem',
        options: {
          path: contentPath,
          name: contentPath
        }
      }
    ]
      .filter(Boolean)
  }
}