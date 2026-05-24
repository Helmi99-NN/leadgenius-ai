import puppeteer from 'puppeteer';
import fs from 'fs';

const USERNAME = 'helmi_naufal';
const BASE_URL = `https://shopee.co.id/${USERNAME}`;

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeShopee() {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 90000 });
    await delay(10000);
    
    const data = await page.evaluate(async (username) => {
        try {
            const shopRes = await fetch(`https://shopee.co.id/api/v4/shop/get_shop_detail?username=${username}`);
            const shopData = await shopRes.json();
            if (!shopData || !shopData.data) return { error: 'Gagal mendapatkan shopId', debugShop: shopData };
            const shopId = shopData.data.shopid;
            
            const itemRes = await fetch(`https://shopee.co.id/api/v4/shop/search_items?offset=0&limit=30&order=sales&base_sq_condition=1&shopid=${shopId}`);
            const itemData = await itemRes.json();
            
            return { success: true, shopId, debugItem: itemData };
        } catch (error) {
            return { error: error.message };
        }
    }, USERNAME);
    
    console.log(JSON.stringify(data, null, 2));
    await browser.close();
}

scrapeShopee();
