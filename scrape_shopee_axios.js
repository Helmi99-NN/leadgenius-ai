import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const USERNAME = 'helmi_naufal';
const BASE_URL = `https://shopee.co.id/${USERNAME}`;

function escapeCsvField(field) {
    if (field === null || field === undefined) return '""';
    const stringField = String(field);
    return '"' + stringField.replace(/"/g, '""') + '"';
}

async function scrapeShopee() {
    console.log("Mencoba mengambil HTML mentah dari Google Cache atau akses langsung Axios...");
    
    // Kita gunakan header ringan
    const headers = {
        'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
    };

    try {
        const response = await axios.get(BASE_URL, { headers });
        const html = response.data;
        const $ = cheerio.load(html);
        
        const links = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('-i.')) {
                links.push(href);
            }
        });
        
        console.log(`Ditemukan ${links.length} produk dari HTML mentah.`);
        
        if (links.length === 0) {
            console.log("Toko ini sepertinya dilindungi sepenuhnya atau mengandalkan Javascript murni (CSR) tanpa SSR.");
            return;
        }

    } catch (error) {
        console.log("Axios diblokir: " + error.message);
    }
}

scrapeShopee();
