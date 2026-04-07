const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

// Parse .env
const envPath = path.join(__dirname, '.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => { 
  const [k, ...v] = line.split('='); 
  if(k && v) acc[k] = v.join('=').trim(); 
  return acc; 
}, {});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function exportData() {
  console.log("Fetching services...");
  const { data: services } = await supabase.from('services').select('*');
  
  console.log("Fetching products...");
  const { data: products } = await supabase.from('products').select('*');
  
  console.log("Fetching gallery...");
  const { data: gallery } = await supabase.from('gallery_items').select('*');

  console.log("Generating Excel file...");
  const wb = xlsx.utils.book_new();
  
  const wsServices = xlsx.utils.json_to_sheet(services || []);
  const wsProducts = xlsx.utils.json_to_sheet(products || []);
  const wsGallery = xlsx.utils.json_to_sheet(gallery || []);

  xlsx.utils.book_append_sheet(wb, wsServices, "Services");
  xlsx.utils.book_append_sheet(wb, wsProducts, "Produits Boutique");
  xlsx.utils.book_append_sheet(wb, wsGallery, "Galerie Photos");

  const outputPath = path.join(__dirname, '..', 'GilbertPro_Catalogue.xlsx');
  xlsx.writeFile(wb, outputPath);
  
  console.log("Export fully complete! Saved to:", outputPath);
}

exportData().catch(console.error);
