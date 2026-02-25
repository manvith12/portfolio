/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://www.manvith.tech",
  generateRobotsTxt: false, // We maintain a manual public/robots.txt
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
};

module.exports = config;
