/**
 * Fungsi processInput memproses input pengguna untuk mengekstrak nilai
 * arus, tegangan, daya, dan lingkungan penggunaan.
 * 
 * Sistem mendukung berbagai format satuan, misalnya:
 * - Arus: A, a, amper, ampere, kA (dengan prefix kilo)
 * - Tegangan: V, volt, kv (dengan prefix kilo)
 * - Daya: W, w, watt, kw (dengan prefix kilo)
 */
function processInput(input) {
  // Normalisasi input (huruf kecil) agar pencarian tidak sensitif kapital
  const normalizedInput = input.toLowerCase();

  // Pola regex untuk mendeteksi angka dan satuan
  const currentRegex = /(\d+(\.\d+)?)(\s*)(ka|a|amper|ampere|ma)/i;
  const voltageRegex = /(\d+(\.\d+)?)(\s*)(kv|v|volt|mv)/i;
  const powerRegex   = /(\d+(\.\d+)?)(\s*)(kw|w|watt|mw)/i;

  let current = null;
  let voltage = null;
  let power = null;
  let environment = null;

  // Ekstraksi nilai arus
  const currentMatch = normalizedInput.match(currentRegex);
  if (currentMatch) {
    current = parseFloat(currentMatch[1]);
    // Jika ada prefiks 'k' (kilo), kalikan 1000
    if (currentMatch[4].includes("k")) {
      current *= 1000;
    }
    // Jika ada prefiks 'm' (mili), bagi 1000
    if (currentMatch[4].includes("m")) {
      current /= 1000;
    }
  }

  // Ekstraksi nilai tegangan
  const voltageMatch = normalizedInput.match(voltageRegex);
  if (voltageMatch) {
    voltage = parseFloat(voltageMatch[1]);
    if (voltageMatch[4].includes("k")) {
      voltage *= 1000;
    }
    if (voltageMatch[4].includes("m")) {
      voltage /= 1000;
    }
  }

  // Ekstraksi nilai daya
  const powerMatch = normalizedInput.match(powerRegex);
  if (powerMatch) {
    power = parseFloat(powerMatch[1]);
    if (powerMatch[4].includes("k")) {
      power *= 1000;
    }
    if (powerMatch[4].includes("m")) {
      power /= 1000;
    }
  }

  // Deteksi lingkungan penggunaan (misalnya: indoor, outdoor, extreme, laut, tanah)
  const environments = ["indoor", "outdoor", "extreme", "laut", "tanah","basah", "kering", "hangat", "dingin", "ruang terbuka","industri", "komersial"];
  environments.forEach(env => {
    if (normalizedInput.includes(env)) {
      environment = env;
    }
  });

  return { current, voltage, power, environment };
}

/**
 * Fungsi untuk menghitung ketebalan isolasi kabel untuk tegangan tinggi.
 * Contoh rumus: tebal isolasi (mm) = (tegangan / 1000) + 1
 * Rumus ini hanya sebagai contoh dan dapat disesuaikan dengan standar yang berlaku.
 */
function calculateInsulation(voltage) {
  if (voltage > 1000) {
    return (voltage / 1000) + 1;
  }
  return null;
}
