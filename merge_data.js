import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const fileDesc = 'data produk shopee.xlsx';
const filePrice = 'Daftar harga produk.xlsx';
const outputFile = path.join('src', 'data', 'shopee_products.json');

function parseExcel(filePath, keyword) {
    if (!fs.existsSync(filePath)) {
        console.error(`File ${filePath} tidak ditemukan!`);
        return null;
    }
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    let headerIdx = -1;
    for (let i = 0; i < Math.min(10, rows.length); i++) {
        if (rows[i] && rows[i].some(c => typeof c === 'string' && c.toLowerCase().includes(keyword))) {
            headerIdx = i; break;
        }
    }
    
    if (headerIdx === -1) return null;
    
    const headers = rows[headerIdx];
    const data = [];
    for (let i = headerIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row.length) continue;
        const obj = {};
        for(let j=0; j<headers.length; j++) {
            if(headers[j]) obj[headers[j]] = row[j];
        }
        data.push(obj);
    }
    return data;
}

function mergeData() {
    console.log("Membaca data deskripsi...");
    const descData = parseExcel(fileDesc, 'nama produk');
    console.log("Membaca data harga...");
    const priceData = parseExcel(filePrice, 'nama produk');
    
    if (!descData || !priceData) {
        console.error("Gagal membaca salah satu file Excel.");
        return;
    }
    
    // Create a map of Price Data based on 'Kode Produk'
    const priceMap = {};
    for (const item of priceData) {
        if (item['Kode Produk']) {
            priceMap[item['Kode Produk']] = item['Harga'];
        }
    }
    
    const merged = [];
    for (const item of descData) {
        const kode = item['Kode Produk'];
        const name = item['Nama Produk'];
        if (!name || String(name).includes('Penjelasan:')) continue;
        
        let price = '0';
        if (kode && priceMap[kode]) {
            price = priceMap[kode];
        }
        
        merged.push({
            id: kode || `SHP-${Math.floor(Math.random()*100000)}`,
            judul: name,
            harga: price,
            deskripsi: item['Deskripsi Produk'] || ''
        });
    }
    
    if (!fs.existsSync(path.join('src', 'data'))) {
        fs.mkdirSync(path.join('src', 'data'), { recursive: true });
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`Berhasil menggabungkan ${merged.length} produk dan menyimpannya di ${outputFile}`);
}

mergeData();
