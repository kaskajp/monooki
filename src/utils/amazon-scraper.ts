import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface AmazonProductData {
  title: string;
  description: string;
  price: number | null;
  model: string;
  images: string[];
  availability: string;
  brand: string;
  features: string[];
}

interface ScrapedProductData {
  name: string;
  description: string;
  purchase_price: number | null;
  model_number: string;
  purchase_location: string;
  imageUrls: string[];
}

export class AmazonScraper {
  private static async launchBrowser() {
    return await puppeteer.launch({
      headless: true,
      // Use the system-installed Chromium in Docker
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });
  }

  static async scrapeProduct(url: string): Promise<ScrapedProductData> {
    // Validate Amazon URL
    if (!this.isValidAmazonUrl(url)) {
      throw new Error('Invalid Amazon URL');
    }

    const browser = await this.launchBrowser();
    let page;
    
    try {
      page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to the product page
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for key elements to load
      await page.waitForSelector('#productTitle', { timeout: 10000 });

      // Get the page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract product information
      const productData = this.extractProductData($, url);
      
      return productData;
      
    } catch (error) {
      console.error('Error scraping Amazon product:', error);
      throw new Error(`Failed to scrape product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (page) await page.close();
      await browser.close();
    }
  }

  private static isValidAmazonUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const amazonDomains = [
        'amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr',
        'amazon.it', 'amazon.es', 'amazon.ca', 'amazon.com.au',
        'amazon.co.jp', 'amazon.in', 'amazon.com.br', 'amazon.com.mx', 'amazon.se'
      ];
      
      return amazonDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname === `www.${domain}`
      );
    } catch {
      return false;
    }
  }

  private static extractProductData($: cheerio.CheerioAPI, url: string): ScrapedProductData {
    // Extract title
    const title = $('#productTitle').text().trim() || 
                  $('h1[data-automation-id="product-title"]').text().trim() ||
                  $('h1.a-size-large').text().trim();

    // Extract description - try multiple selectors
    let description = '';
    const featureBullets = $('#feature-bullets ul li:not(.a-last) .a-list-item').map((_, el) => $(el).text().trim()).get();
    const productDescription = $('#productDescription p').text().trim();
    const aboutItem = $('#feature-bullets ul li span').map((_, el) => $(el).text().trim()).get();
    
    if (featureBullets.length > 0) {
      description = featureBullets.join('. ');
    } else if (aboutItem.length > 0) {
      description = aboutItem.filter(item => item.length > 10).join('. ');
    } else if (productDescription) {
      description = productDescription;
    }

    // Extract price - try multiple selectors
    let price: number | null = null;
    const priceSelectors = [
      '.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen',
      '.a-price-current .a-offscreen',
      '.a-price .a-offscreen',
      '#priceblock_dealprice',
      '#priceblock_ourprice',
      '.a-price-whole'
    ];

    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text().trim();
      if (priceText) {
        const match = priceText.match(/[\d,]+\.?\d*/);
        if (match) {
          price = parseFloat(match[0].replace(/,/g, ''));
          break;
        }
      }
    }

    // Extract model number
    let modelNumber = '';
    // Try to find model number in product details
    $('#productDetails_detailBullets_sections1 tr').each((_, row) => {
      const label = $(row).find('td:first-child').text().trim().toLowerCase();
      if (label.includes('model') || label.includes('item model number')) {
        modelNumber = $(row).find('td:last-child').text().trim();
        return false; // break
      }
    });

    // Alternative selector for model number
    if (!modelNumber) {
      $('#productDetails_techSpec_section_1 tr').each((_, row) => {
        const label = $(row).find('td:first-child').text().trim().toLowerCase();
        if (label.includes('model') || label.includes('item model number')) {
          modelNumber = $(row).find('td:last-child').text().trim();
          return false; // break
        }
      });
    }

    // Extract images
    const imageUrls: string[] = [];
    
    // Main product image
    const mainImage = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src');
    if (mainImage) {
      imageUrls.push(mainImage);
    }

    // Additional images from thumbnail gallery
    $('#altImages img').each((_, img) => {
      const src = $(img).attr('src');
      if (src && !src.includes('play-icon') && !imageUrls.includes(src)) {
        // Convert thumbnail URL to larger image
        const largeImageUrl = src.replace(/\._[A-Z0-9_,]+_\./, '._AC_SL1500_.');
        imageUrls.push(largeImageUrl);
      }
    });

    return {
      name: title || 'Unknown Product',
      description: description || '',
      purchase_price: price,
      model_number: modelNumber || '',
      purchase_location: 'Amazon',
      imageUrls: imageUrls
    };
  }

  // Download images from URLs and save them to local storage
  static async downloadImages(imageUrls: string[], workspaceId: string): Promise<Array<{filename: string, original_name: string, mime_type: string, size: number}>> {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const downloadedImages = [];
    
    for (let i = 0; i < Math.min(imageUrls.length, 5); i++) { // Limit to 5 images
      const imageUrl = imageUrls[i];
      
      try {
        const response = await axios({
          method: 'GET',
          url: imageUrl,
          responseType: 'stream',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        // Get file extension from URL or Content-Type
        let extension = '.jpg'; // default
        const contentType = response.headers['content-type'];
        
        if (contentType) {
          if (contentType.includes('png')) extension = '.png';
          else if (contentType.includes('gif')) extension = '.gif';
          else if (contentType.includes('webp')) extension = '.webp';
        } else {
          // Try to get extension from URL
          const urlPath = new URL(imageUrl).pathname;
          const urlExtension = path.extname(urlPath);
          if (urlExtension) extension = urlExtension;
        }

        const filename = `${uuidv4()}${extension}`;
        const filePath = path.join(uploadsDir, filename);
        
        // Create write stream
        const writer = fs.createWriteStream(filePath);
        
        // Pipe the response to the file
        response.data.pipe(writer);
        
        // Wait for the download to complete
        await new Promise<void>((resolve, reject) => {
          writer.on('finish', () => resolve());
          writer.on('error', reject);
        });

        // Get file stats
        const stats = fs.statSync(filePath);
        
        downloadedImages.push({
          filename,
          original_name: `amazon-image-${i + 1}${extension}`,
          mime_type: contentType || 'image/jpeg',
          size: stats.size
        });
        
      } catch (error) {
        console.error(`Failed to download image ${imageUrl}:`, error);
        // Continue with other images even if one fails
      }
    }
    
    return downloadedImages;
  }

  // Helper method to clean up Amazon URLs (remove tracking parameters)
  static cleanAmazonUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Find the product ID (ASIN)
      let productId = '';
      const dpIndex = pathParts.indexOf('dp');
      const gpIndex = pathParts.indexOf('gp');
      
      if (dpIndex !== -1 && dpIndex + 1 < pathParts.length) {
        productId = pathParts[dpIndex + 1];
      } else if (gpIndex !== -1 && gpIndex + 1 < pathParts.length) {
        productId = pathParts[gpIndex + 1];
      }
      
      if (productId) {
        return `${urlObj.origin}/dp/${productId}`;
      }
      
      return url;
    } catch {
      return url;
    }
  }
} 