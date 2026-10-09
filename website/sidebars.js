// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'intro',
    'architecture',
    'getting-started',
    {
      type: 'category',
      label: 'Writing mods',
      collapsed: false,
      items: ['writing-mods', 'language-reference', 'packets'],
    },
    {
      type: 'category',
      label: 'Under the hood',
      items: ['loader', 'compiler', 'updating-the-loader', 'anticheat'],
    },
    'api',
  ],
};

export default sidebars;
