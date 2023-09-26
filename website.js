const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// put website here
const baseUrl = 'https://example.com/';

const outputFolder = 'scraped_data';

async function scrapeWebsite() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(baseUrl);

  const links = await page.evaluate(() => {
    const anchorElements = document.querySelectorAll('a');
    return Array.from(anchorElements).map(anchor => anchor.href);
  });

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  for (const link of links) {
    try {
      const response = await axios.get(link);
      const htmlContent = response.data;

      const filename = path.join(outputFolder, link.replace(/[^a-zA-Z0-9]/g, '_') + '.html');

      fs.writeFileSync(filename, htmlContent);

      console.log(`Saved ${filename}`);
    } catch (error) {
      console.error(`Error fetching ${link}: ${error.message}`);
    }
  }

  await browser.close();
}

scrapeWebsite()
  .then(() => console.log('Website scraping complete.'))
  .catch(error => console.error('Error:', error));
