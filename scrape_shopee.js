import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const USERNAME = 'helmi_naufal';
const BASE_URL = `https://shopee.co.id/${USERNAME}?page=0&sortBy=pop`;

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeCsvField(field) {
    if (field === null || field === undefined) return '""';
    const stringField = String(field);
    return '"' + stringField.replace(/"/g, '""') + '"';
}

async function scrapeShopee() {
    console.log("Membuka browser dengan Stealth Mode (Anti-Deteksi)...");
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    
    console.log(`Mengakses halaman toko: ${BASE_URL}...`);
    try {
        await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 90000 });
    } catch(e) {
        console.log("Timeout saat load awal, tapi lanjut saja...");
    }
    
    console.log("Menunggu 15 detik (Silakan selesaikan Login/Captcha jika ada)...");
    await delay(15000);
    
    // Scroll sampai ke bawah untuk memuat produk
    console.log("Melakukan scroll...");
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 300;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });
    
    await delay(5000); // Tunggu lazy load
    
    // Ambil daftar produk dari DOM
    console.log("Mengekstrak data produk dari halaman utama...");
    const products = await page.evaluate(() => {
        const results = [];
        // Shopee biasanya menggunakan div dengan class yg membungkus item
        // Kita cari semua tag 'a' yang mengandung link ke produk ('-i.')
        const links = Array.from(document.querySelectorAll('a'));
        const productLinks = links.filter(a => a.href && (a.href.includes('-i.') || a.href.includes('/product/')));
        
        // Hapus duplikat link
        const uniqueHrefs = [...new Set(productLinks.map(a => a.href))];
        
        for (const href of uniqueHrefs) {
            results.push({ link: href });
        }
        return results;
    });
    
    console.log(`Ditemukan ${products.length} produk!`);
    
    if (products.length === 0) {
        console.log("Masih gagal menemukan produk. Pastikan tidak ada popup yang menghalangi.");
        await browser.close();
        return;
    }
    
    const results = [];
    
    for (let i = 0; i < products.length; i++) {
        const itemUrl = products[i].link;
        console.log(`\nMengakses produk ${i+1}/${products.length}...`);
        
        try {
            await page.goto(itemUrl, { waitUntil: 'networkidle2', timeout: 60000 });
            await delay(5000); // Tunggu render
            
            // Ambil detail
            const detail = await page.evaluate(() => {
                // Selector Judul
                let title = 'Judul tidak ditemukan';
                const titleSelectors = ['h1 span', 'div.WBcLj- span', '.attM6y span', '.V5vLz', 'span[style*="word-break: break-word"]'];
                for(let sel of titleSelectors) {
                    const el = document.querySelector(sel);
                    if(el && el.innerText.trim()) {
                        title = el.innerText.trim();
                        break;
                    }
                }
                
                // Selector Harga
                let price = '0';
                const priceSelectors = ['.pqTWkA', '.G27FPf', 'div.flex.items-center .pqTWkA', 'div[class*="price"]'];
                for(let sel of priceSelectors) {
                    const el = document.querySelector(sel);
                    if(el && el.innerText.trim()) {
                        price = el.innerText.trim();
                        break;
                    }
                }
                
                // Selector Deskripsi
                let description = 'Deskripsi tidak ditemukan';
                const descSelectors = ['div[style*="white-space: pre-wrap"]', 'div.f7aqe\\+', '.f7aqe\\+', '.product-detail', 'div[class*="product-description"]'];
                for(let sel of descSelectors) {
                    const el = document.querySelector(sel);
                    if(el && el.innerText.trim()) {
                        description = el.innerText.trim();
                        break;
                    }
                }
                
                return { title, price, description };
            });
            
            console.log(`Judul: ${detail.title.substring(0, 40)}...`);
            
            results.push({
                Judul: detail.title,
                Harga: detail.price,
                Deskripsi: detail.description
            });
            
        } catch(e) {
            console.log(`Gagal memuat produk: ${e.message}`);
        }
    }
    
    await browser.close();
    
    const csvFile = 'shopee_products.csv';
    const csvContent = [];
    csvContent.push('Judul,Harga,Deskripsi');
    for (const res of results) {
        csvContent.push(`${escapeCsvField(res.Judul)},${escapeCsvField(res.Harga)},${escapeCsvField(res.Deskripsi)}`);
    }
    fs.writeFileSync(csvFile, csvContent.join('\n'), 'utf8');
    console.log(`\nSukses menyimpan ${results.length} produk ke ${csvFile}!`);
}

scrapeShopee();
