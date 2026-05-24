import puppeteer from 'puppeteer';
import fs from 'fs';

const USERNAME = 'helmi_naufal';
const BASE_URL = `https://shopee.co.id/${USERNAME}?page=0&sortBy=pop`; // menggunakan parameter page agar masuk ke tab produk

async function run() {
    console.log("Membuka browser untuk inspeksi halaman...");
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 90000 });
    
    console.log("Menunggu 20 detik agar halaman termuat...");
    await new Promise(r => setTimeout(r, 20000));
    
    // Dump HTML
    const html = await page.content();
    fs.writeFileSync('shopee_dump.html', html, 'utf8');
    
    // Ambil semua href
    const hrefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h);
    });
    fs.writeFileSync('shopee_hrefs.txt', hrefs.join('\n'), 'utf8');
    
    console.log("Dumped HTML dan Links.");
    await browser.close();
}
run();
