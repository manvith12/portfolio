/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || "https://example.com",
  generateRobotsTxt: true,
  changefreq: "weekly",
};

module.exports = config;
