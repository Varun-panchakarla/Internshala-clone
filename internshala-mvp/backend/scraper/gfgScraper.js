const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { fetchWithAxios } = require('./utils.js');

// Parse CLI arguments
const category = process.argv[2] || 'python';
const targetUrl = process.argv[3] || 'https://www.geeksforgeeks.org/python/python-interview-questions/';
const outputFilename = process.argv[4] || `${category}_interview_questions.json`;

// Deduplicate and filter code blocks (same helper logic as in UI)
function getUniqueCodeSnippets(codeList) {
  if (!codeList || codeList.length === 0) return [];
  
  const cleanList = codeList
    .map(c => c.replace(/\u200b/g, '').trim())
    .filter(c => c.length > 0);

  return cleanList.filter((snippet, index) => {
    const isFragment = cleanList.some((otherSnippet, otherIndex) => {
      if (otherIndex === index) return false;
      if (otherSnippet.length <= snippet.length) return false;
      const normalizedOther = otherSnippet.replace(/\s+/g, ' ');
      const normalizedSelf = snippet.replace(/\s+/g, ' ');
      return normalizedOther.includes(normalizedSelf);
    });
    return !isFragment;
  });
}

async function runScraper() {
  console.log(`[Scraper] Starting GFG scraper for category: ${category}`);
  console.log(`[Scraper] Fetching URL: ${targetUrl}`);
  
  try {
    const response = await fetchWithAxios(targetUrl);
    const $ = cheerio.load(response.data);
    
    // Automatically read page title
    const pageTitle = $('h1').text().trim() || `${category.charAt(0).toUpperCase() + category.slice(1)} Interview Questions`;
    
    // Automatically read canonical/current page URL
    const pageUrl = $('link[rel="canonical"]').attr('href') || targetUrl;
    
    const sections = [];
    let currentSection = null;
    
    // Identify the main content container
    const $content = $('.article--viewer_content, .MainArticleContent_articleMainContentCss__b_1_R, .text');
    if ($content.length === 0) {
      throw new Error('Could not locate the main article content container.');
    }
    
    // Select elements to preserve order of headings, paragraphs, lists, images, code blocks, and tables
    const $elements = $content.find('h2, h3, h4, p, ul, ol, pre, img, table');
    
    $elements.each((_, el) => {
      const tagName = el.name;
      const $el = $(el);
      
      // Filter out elements inside sidebars, ads, or output panels
      if ($el.closest('.code-output, .sidebar, .comments-list, #respond').length > 0) {
        return;
      }

      // Filter out elements nested inside tables to prevent duplicate extraction
      if (tagName !== 'table' && $el.closest('table').length > 0) {
        return;
      }
      
      // 1. Heading Elements
      if (['h2', 'h3', 'h4'].includes(tagName)) {
        const headingText = $el.text().trim();
        if (headingText) {
          console.log("Question started:", headingText);
          currentSection = {
            heading: headingText,
            paragraphs: [],
            lists: [],
            images: [],
            code: [],
            tables: []
          };
          sections.push(currentSection);
        }
        return;
      }
      
      // If we haven't encountered any section headings yet, skip child content elements
      if (!currentSection) return;
      
      // 2. Paragraph Elements
      if (tagName === 'p') {
        const pText = $el.text().trim();
        if (pText) {
          currentSection.paragraphs.push(pText);
        }
        
        // Extract inline images if present
        $el.find('img').each((_, imgEl) => {
          const src = $(imgEl).attr('src') || $(imgEl).attr('data-src');
          const alt = $(imgEl).attr('alt') || '';
          if (src && !src.startsWith('data:image')) {
            currentSection.images.push({ alt, src });
          }
        });
        return;
      }
      
      // 3. Lists
      if (['ul', 'ol'].includes(tagName)) {
        const listItems = [];
        $el.find('li').each((_, liEl) => {
          const itemText = $(liEl).text().trim();
          if (itemText) {
            listItems.push(itemText);
          }
        });
        if (listItems.length > 0) {
          currentSection.lists.push(listItems);
        }
        return;
      }
      
      // 4. Code Blocks
      if (tagName === 'pre') {
        const $codeClone = $el.clone();
        $codeClone.find('br').replaceWith('\n');
        let codeText = $codeClone.text();
        
        // Strip any nested syntax-highlighting HTML elements (like span, div, code, pre)
        const htmlTagPattern = /<\/?(span|div|code|pre|p|a|br|img|strong|em|li|ul|ol)\b[^>]*>/gi;
        codeText = codeText.replace(htmlTagPattern, '');
        
        // Normalize any encoded entities
        codeText = codeText
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&');

        if (codeText.trim()) {
          currentSection.code.push(codeText);
        }
        return;
      }
      
      // 5. Standalone Images
      if (tagName === 'img') {
        if ($el.closest('p, ul, ol, pre').length > 0) {
          return;
        }
        const src = $el.attr('src') || $el.attr('data-src');
        const alt = $el.attr('alt') || '';
        if (src && !src.startsWith('data:image')) {
          currentSection.images.push({ alt, src });
        }
        return;
      }

      // 6. Tables
      if (tagName === 'table') {
        console.log("Table found:", currentSection ? currentSection.heading : "No active section");
        const headers = [];
        const rows = [];
        
        $el.find('tr').each((trIdx, trEl) => {
          const rowData = [];
          const cells = $(trEl).children('th, td');
          if (cells.length > 0) {
            cells.each((_, cellEl) => {
              const text = $(cellEl).text();
              const cleanedText = text
                .split(/\r?\n/)
                .map(line => line.trim().replace(/[ \t]+/g, ' '))
                .filter(line => line.length > 0)
                .join('\n');
              rowData.push(cleanedText);
            });
            
            const isHeaderRow = $(trEl).closest('thead').length > 0 || (headers.length === 0 && trIdx === 0);
            if (isHeaderRow && headers.length === 0) {
              headers.push(...rowData);
            } else {
              rows.push(rowData);
            }
          }
        });
        
        if (headers.length === 0 && rows.length > 0) {
          headers.push(...rows.shift());
        }

        if (headers.length > 0 || rows.length > 0) {
          currentSection.tables = currentSection.tables || [];
          currentSection.tables.push({ headers, rows });
        }
        return;
      }
    });
    
    // Post-process sections to deduplicate code fragments
    const processedSections = sections.map(sec => ({
      ...sec,
      code: getUniqueCodeSnippets(sec.code)
    }));
    
    const outputData = {
      title: pageTitle,
      url: pageUrl,
      sections: processedSections
    };

    // Helper to clean invisible/unwanted unicode, control characters and double backticks
    const cleanString = (str) => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E\uFFFD\u25A1]/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
        .replace(/```/g, '___TRIPLE_BACKTICK___')
        .replace(/``/g, '`')
        .replace(/___TRIPLE_BACKTICK___/g, '```')
        .trim();
    };

    const cleanData = (obj) => {
      if (typeof obj === 'string') {
        return cleanString(obj);
      } else if (Array.isArray(obj)) {
        return obj.map(cleanData);
      } else if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        for (const key in obj) {
          cleaned[key] = cleanData(obj[key]);
        }
        return cleaned;
      }
      return obj;
    };

    const cleanedOutputData = cleanData(outputData);
    
    // Save to the frontend data directory
    const outputDir = path.join(__dirname, '../../src/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, outputFilename);
    fs.writeFileSync(outputPath, JSON.stringify(cleanedOutputData, null, 2), 'utf-8');
    
    console.log("Question saved:", processedSections.length, "questions total.");
    console.log(`[Scraper] Success! Scraped ${processedSections.length} sections.`);
    console.log(`[Scraper] Saved payload to: ${outputPath}`);
  } catch (error) {
    console.error(`[Scraper] Scraping failed: ${error.message}`);
    process.exit(1);
  }
}

runScraper();
