import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Assay",
  description: "The TypeScript-native LLM evaluation framework",
  base: "/assay/",

  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API", link: "/api/" },
      { text: "Metrics", link: "/metrics/" },
      {
        text: "GitHub",
        link: "https://github.com/assay-ai/assay",
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Why Assay?", link: "/guide/why-assay" },
            { text: "Quick Start", link: "/guide/getting-started" },
            { text: "Configuration", link: "/guide/configuration" },
          ],
        },
      ],
      "/metrics/": [
        {
          text: "Metrics",
          items: [
            { text: "Overview", link: "/metrics/" },
            { text: "RAG Metrics", link: "/metrics/rag" },
            { text: "Agentic Metrics", link: "/metrics/agentic" },
            {
              text: "Conversational Metrics",
              link: "/metrics/conversational",
            },
            { text: "Safety Metrics", link: "/metrics/safety" },
            { text: "Custom Metrics", link: "/metrics/custom" },
            { text: "Non-LLM Metrics", link: "/metrics/non-llm" },
          ],
        },
      ],
      "/integrations/": [
        {
          text: "Integrations",
          items: [
            { text: "Vitest", link: "/integrations/vitest" },
            { text: "Jest", link: "/integrations/jest" },
            { text: "Vercel AI SDK", link: "/integrations/ai-sdk" },
            { text: "CLI", link: "/integrations/cli" },
          ],
        },
      ],
      "/providers/": [
        {
          text: "Providers",
          items: [{ text: "Overview", link: "/providers/" }],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [{ text: "Overview", link: "/api/" }],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/assay-ai/assay" }],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright 2024-present Assay AI",
    },

    search: {
      provider: "local",
    },

    editLink: {
      pattern: "https://github.com/assay-ai/assay/edit/main/apps/docs/:path",
      text: "Edit this page on GitHub",
    },
  },
});
