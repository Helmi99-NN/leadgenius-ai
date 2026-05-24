import xlsx from 'xlsx';
import fs from 'fs';

const filePath = 'data produk shopee.xlsx';

function escapeCsvField(field) {
    if (field === null || field === undefined) return '""';
    const stringField = String(field);
    return '"' + stringField.replace(/"/g, '""') + '"';
}

function processExcel() {
    console.log(`Membaca file ${filePath}...`);
    if (!fs.existsSync(filePath)) {
        console.error(`File "${filePath}" tidak ditemukan di d:\\Fibermedia\\Superapp!`);
        return;
    }
    
    // Membaca workbook
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Mengonversi ke array 2 dimensi untuk mencari letak header
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    if (rows.length === 0) {
        console.error("File Excel kosong.");
        return;
    }
    
    // Cari baris header (Shopee biasanya meletakkan header di baris ke-3 atau ke-4)
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, rows.length); i++) {
        const row = rows[i];
        if (row && row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('nama produk'))) {
            headerRowIndex = i;
            break;
        }
    }
    
    if (headerRowIndex === -1) {
        console.error("Tidak dapat menemukan kolom 'Nama Produk'. Berikut cuplikan file Anda:");
        console.log(rows.slice(0, 5));
        return;
    }
    
    const headers = rows[headerRowIndex];
    let titleIdx = -1, priceIdx = -1, descIdx = -1;
    
    for (let i = 0; i < headers.length; i++) {
        const h = String(headers[i] || '').toLowerCase();
        if (h.includes('nama produk')) titleIdx = i;
        if (h.includes('harga')) priceIdx = i;
        if (h.includes('deskripsi')) descIdx = i;
    }
    
    console.log(`Kolom terdeteksi - Judul: ${titleIdx}, Harga: ${priceIdx}, Deskripsi: ${descIdx}`);
    
    const results = [];
    // Baca baris-baris data di bawah header
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[titleIdx]) continue; // Lewati jika nama produk kosong
        
        // Shopee kadang punya row penjelasan di bawah header utama, kita abaikan row yang panjangnya ga masuk akal
        if (String(row[titleIdx]).includes('Penjelasan:')) continue;
        
        let title = row[titleIdx];
        let price = priceIdx !== -1 ? row[priceIdx] : '0';
        let desc = descIdx !== -1 ? row[descIdx] : '';
        
        results.push({ Judul: title, Harga: price, Deskripsi: desc });
    }
    
    console.log(`Berhasil mengekstrak ${results.length} produk dari file Excel.`);
    
    const csvFile = 'shopee_products_final.csv';
    const csvContent = [];
    csvContent.push('Judul,Harga,Deskripsi'); // Header CSV
    for (const res of results) {
        csvContent.push(`${escapeCsvField(res.Judul)},${escapeCsvField(res.Harga)},${escapeCsvField(res.Deskripsi)}`);
    }
    
    fs.writeFileSync(csvFile, csvContent.join('\n'), 'utf8');
    console.log(`\nSukses! Data telah disimpan dalam format CSV dengan nama: ${csvFile}`);
}

processExcel();
