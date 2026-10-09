// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'moomoo.js',
  tagline: 'A modding framework for MooMoo.io private servers',
  favicon: 'img/favicon.svg',

  url: 'https://example.com',
  baseUrl: '/',

  organizationName: 'you',
  projectName: 'moomoo.js',

  onBrokenLinks: 'warn',

  i18n: { defaultLocale: 'en', locales: ['en'] },

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: { defaultMode: 'dark', respectPrefersColorScheme: true },
      navbar: {
        title: 'moomoo.js',
        logo: { alt: 'moomoo.js', src: 'img/logo.svg' },
        items: [
          { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' },
          { to: '/playground/', label: 'Playground', position: 'left' },
          { href: 'https://github.com/you/moomoo.js', label: 'GitHub', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              { label: 'Introduction', to: '/docs/intro' },
              { label: 'Getting started', to: '/docs/getting-started' },
              { label: 'Language reference', to: '/docs/language-reference' },
              { label: 'Packet reference', to: '/docs/packets' },
            ],
          },
          {
            title: 'Tools',
            items: [
              { label: 'Playground', to: '/playground/' },
              { label: 'Compiler', to: '/docs/compiler' },
              { label: 'The loader', to: '/docs/loader' },
            ],
          },
        ],
        copyright: `moomoo.js — for use on your own private server. Educational.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json'],
      },
    }),
};

export default config;
