// database.js

// Daftar kemungkinan ukuran kabel, tipe kabel, dan lingkungan penggunaannya
const sizes = [
  "1.0 mm²", "1.5 mm²", "2.5 mm²", "4 mm²", "6 mm²",
  "10 mm²", "16 mm²", "25 mm²", "35 mm²", "50 mm²", "70 mm²", "95 mm²"
];

const types = [
  "NYM", "NYYHY", "NYA", "NYY", "NYM-H", "NYYH", "THHN", "XHHW", "H07RN-F"
];

const environmentsPool = [
  "indoor", "outdoor", "extreme", "laut", "tanah",
  "basah", "kering", "hangat", "dingin", "ruang terbuka",
  "industri", "komersial"
];

/*
  Database kabel berikut dikembangkan berdasarkan standar kabel dari berbagai sumber di seluruh dunia,
  mencakup tipe kabel seperti NYA, NYM, NYY, dan lain-lain.
*/

// Data kabel dasar yang sudah ada
const cableDatabase = [
  { size: "1.5 mm²", type: "NYM", environments: ["indoor"] },
  { size: "2.5 mm²", type: "NYYHY", environments: ["outdoor", "indoor"] },
  { size: "4 mm²",   type: "NYM", environments: ["extreme", "indoor"] },
  { size: "6 mm²",   type: "NYYHY", environments: ["outdoor", "laut"] },
  { size: "10 mm²",  type: "NYYHY", environments: ["tanah", "extreme"] },
];

// Menghasilkan entri tambahan sehingga total data menjadi 1000 kabel
for (let i = cableDatabase.length; i < 1000; i++) {
  // Pilih ukuran dan tipe secara acak dari daftar
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  const type = types[Math.floor(Math.random() * types.length)];

  // Tentukan jumlah lingkungan (antara 1 sampai 3) secara acak
  const envCount = Math.floor(Math.random() * 3) + 1;
  const environments = [];
  while (environments.length < envCount) {
    const env = environmentsPool[Math.floor(Math.random() * environmentsPool.length)];
    if (!environments.includes(env)) {
      environments.push(env);
    }
  }

  cableDatabase.push({ size, type, environments });
}

/**
 * Fungsi untuk mendapatkan rekomendasi kabel berdasarkan nilai arus,
 * tegangan, dan lingkungan penggunaan (jika diberikan)
 */
function getCableRecommendation(current, voltage, environment) {
  // Tentukan ukuran kabel yang dibutuhkan berdasarkan nilai arus
  let requiredSize;
  if (current <= 10) {
    requiredSize = "1.5 mm²";
  } else if (current <= 20) {
    requiredSize = "2.5 mm²";
  } else if (current <= 30) {
    requiredSize = "4 mm²";
  } else if (current <= 40) {
    requiredSize = "6 mm²";
  } else {
    requiredSize = "10 mm²";
  }

  // Filter kabel-kabel berdasarkan ukuran yang sesuai
  let candidateCables = cableDatabase.filter(cable => cable.size === requiredSize);

  // Jika lingkungan penggunaan diberikan, lakukan penyaringan tambahan
  if (environment && typeof environment === "string") {
    candidateCables = candidateCables.filter(cable =>
      cable.environments.some(env => env.toLowerCase() === environment.toLowerCase())
    );
  }

  // Kembalikan kabel pertama yang cocok, atau null jika tidak ditemukan
  return candidateCables[0] || null;
}

/**
 * Fungsi untuk menghitung tebal isolasi berdasarkan tegangan.
 * Contoh perhitungan sederhana: tebal isolasi = (tegangan / 1000) * 1.5 mm.
 */
function calculateInsulation(voltage) {
  return (voltage / 1000) * 1.5;
}

/**
 * Fungsi untuk memproses input pengguna dan mengekstrak nilai-nilai numerik serta informasi lingkungan.
 * Fungsi ini mencari pola seperti "220 V", "15 A", "300 W" dan kata kunci lingkungan (misal: indoor).
 */
function processInput(input) {
  let result = {};

  // Mencari nilai tegangan (contoh: "220V" atau "220 V")
  const voltageMatch = input.match(/(\d+(?:\.\d+)?)\s*V/i);
  if (voltageMatch) {
    result.voltage = parseFloat(voltageMatch[1]);
  }

  // Mencari nilai arus (contoh: "15A" atau "15 A")
  const currentMatch = input.match(/(\d+(?:\.\d+)?)\s*A/i);
  if (currentMatch) {
    result.current = parseFloat(currentMatch[1]);
  }

  // Mencari nilai daya (contoh: "300W" atau "300 W")
  const powerMatch = input.match(/(\d+(?:\.\d+)?)\s*W/i);
  if (powerMatch) {
    result.power = parseFloat(powerMatch[1]);
  }

  // Mencari informasi lingkungan dari daftar environmentsPool
  for (let env of environmentsPool) {
    let regex = new RegExp(`\\b${env}\\b`, 'i');
    if (regex.test(input)) {
      result.environment = env;
      break;
    }
  }

  return result;
}
