import requests
import csv
import time

USERNAME = "helmi_naufal"

# Header digunakan untuk mensimulasikan browser asli
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': f'https://shopee.co.id/{USERNAME}'
}

def get_shop_id(username):
    url = f"https://shopee.co.id/api/v4/shop/get_shop_detail?username={username}"
    print(f"Mengambil ID toko untuk {username}...")
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if 'data' in data and data['data']:
            return data['data']['shopid']
        else:
            print("Response tidak memiliki data shop. Mungkin diblokir atau username salah.")
            print(data)
    else:
        print(f"Gagal mengambil detail toko. Status code: {response.status_code}")
    return None

def get_items(shop_id):
    items = []
    offset = 0
    limit = 30
    while True:
        url = f"https://shopee.co.id/api/v4/shop/search_items?offset={offset}&limit={limit}&order=sales&base_sq_condition=1&shopid={shop_id}"
        print(f"Mengambil produk (offset: {offset})...")
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if 'items' in data and data['items']:
                batch = data['items']
                items.extend(batch)
                if len(batch) < limit:
                    break # Sudah mencapai akhir
                offset += limit
                time.sleep(1) # Jeda agar tidak terkena rate-limit
            else:
                break
        else:
            print(f"Gagal mengambil produk. Status code: {response.status_code}")
            break
    return items

def get_item_description(item_id, shop_id):
    url = f"https://shopee.co.id/api/v4/item/get?itemid={item_id}&shopid={shop_id}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if 'data' in data and data['data'] and 'description' in data['data']:
            return data['data']['description']
    return "Deskripsi tidak tersedia"

def main():
    shop_id = get_shop_id(USERNAME)
    if not shop_id:
        print("Gagal menemukan Shop ID. Selesai.")
        return

    print(f"Shop ID ditemukan: {shop_id}")
    items = get_items(shop_id)
    print(f"Total produk ditemukan: {len(items)}")
    
    if len(items) == 0:
        print("Tidak ada produk yang bisa diekstrak atau API menolak.")
        return

    results = []
    for idx, item_data in enumerate(items):
        item = item_data.get('item_basic', {})
        item_id = item.get('itemid')
        name = item.get('name')
        # Harga Shopee di API biasanya dikalikan 100000
        price_raw = item.get('price', 0)
        price = price_raw / 100000 if price_raw else 0
        
        print(f"Mengambil deskripsi produk {idx+1}/{len(items)}: {name[:30]}...")
        description = get_item_description(item_id, shop_id)
        
        results.append({
            'Judul': name,
            'Harga': int(price), # Format harga dalam angka bulat
            'Deskripsi': description
        })
        time.sleep(0.5) # Jeda antar request deskripsi
        
    csv_file = 'shopee_products.csv'
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['Judul', 'Harga', 'Deskripsi'])
        writer.writeheader()
        writer.writerows(results)
        
    print(f"\nSukses! Data telah disimpan ke dalam {csv_file}")

if __name__ == "__main__":
    main()
