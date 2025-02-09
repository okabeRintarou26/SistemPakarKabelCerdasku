// chatresponse.js

// Objek memory untuk menyimpan data sementara
const memory = {
  voltage: null,
  current: null,
  power: null,
  environment: null
};

// Variabel global untuk menandai apakah bot sedang menunggu jawaban untuk rekomendasi lain
let awaitingNewRecommendation = false;

document.addEventListener("DOMContentLoaded", function() {
  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatWindow = document.getElementById("chat-window");

  // Fungsi untuk menambahkan pesan ke tampilan chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    if (sender === "user") {
      messageDiv.classList.add("user-message");
    } else {
      messageDiv.classList.add("bot-message");
    }
    messageDiv.innerHTML = text;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Fungsi utama untuk memproses input pengguna
  function processUserInput(input) {
    // Jika bot sedang menunggu jawaban untuk rekomendasi ulang
    if (awaitingNewRecommendation) {
      const answer = input.trim().toLowerCase();
      if (answer === "ya") {
        // Hapus data di memory untuk memulai perhitungan baru
        memory.voltage = null;
        memory.current = null;
        memory.power = null;
        memory.environment = null;
        awaitingNewRecommendation = false;
        addMessage("Silakan masukkan data baru untuk mendapatkan rekomendasi kabel.", "bot");
      } else {
        awaitingNewRecommendation = false;
        addMessage("Baik, jika Anda membutuhkan rekomendasi lain, silakan hubungi saya kembali.", "bot");
      }
      return;
    }

    // Proses input menggunakan fungsi pendeteksian nilai (NLP sederhana) dari database.js
    const parsed = processInput(input);

    // Perbarui memory jika input mengandung nilai yang valid
    if (parsed.current) {
      memory.current = parsed.current;
    }
    if (parsed.voltage) {
      memory.voltage = parsed.voltage;
    }
    if (parsed.power) {
      memory.power = parsed.power;
    }
    if (parsed.environment) {
      memory.environment = parsed.environment;
    }

    let response = "";

    // Hitung jumlah data numerik yang sudah ada (tegangan, arus, dan daya)
    let providedCount = 0;
    if (memory.voltage) providedCount++;
    if (memory.current) providedCount++;
    if (memory.power) providedCount++;

    // Kumpulkan data numerik yang masih kurang
    const missingNumerics = [];
    if (!memory.voltage) missingNumerics.push("tegangan");
    if (!memory.current) missingNumerics.push("arus");
    if (!memory.power) missingNumerics.push("daya");

    // Cek apakah informasi lingkungan pemasangan kabel sudah diberikan
    if (!memory.environment) {
      response += "Silakan masukkan informasi mengenai lingkungan pemasangan kabel (misal: indoor, outdoor, extreme, laut, tanah, basah, kering, hangat, dingin, ruang terbuka, industri, komersial) untuk melanjutkan.<br>";
      addMessage(response, "bot");
      return;
    }

    // Jika data numerik kurang dari dua, minta input yang belum ada
    if (providedCount < 2) {
      response += `Data yang kurang untuk perhitungan: ${missingNumerics.join(", ")}. Silakan masukkan nilai tersebut untuk melanjutkan.`;
      addMessage(response, "bot");
      return;
    }

    // Jika hanya dua dari tiga data numerik tersedia, hitung nilai yang hilang
    if (!memory.power && memory.voltage && memory.current) {
      memory.power = memory.voltage * memory.current;
      response += `Dihitung daya berdasarkan tegangan dan arus: ${memory.power.toFixed(2)} W.<br>`;
    } else if (!memory.voltage && memory.power && memory.current) {
      memory.voltage = memory.power / memory.current;
      response += `Dihitung tegangan berdasarkan daya dan arus: ${memory.voltage.toFixed(2)} V.<br>`;
    } else if (!memory.current && memory.power && memory.voltage) {
      memory.current = memory.power / memory.voltage;
      response += `Dihitung arus berdasarkan daya dan tegangan: ${memory.current.toFixed(2)} A.<br>`;
    } else {
      response += `Data tegangan, arus, dan daya telah lengkap.<br>`;
    }

    // Jika tegangan tinggi, tampilkan peringatan dan hitung tebal isolasi
    if (memory.voltage && memory.voltage > 1000) {
      response += `<b>PERINGATAN: Tegangan tinggi terdeteksi!</b><br>`;
      const insulation = calculateInsulation(memory.voltage);
      response += `Untuk tegangan tinggi, tebal isolasi yang disarankan adalah ${insulation.toFixed(2)} mm.<br>`;
    }

    // Berikan rekomendasi kabel jika data tegangan dan arus tersedia
    if (memory.voltage && memory.current) {
      const recommendation = getCableRecommendation(memory.current, memory.voltage, memory.environment);
      if (recommendation) {
        response += `Rekomendasi kabel: Ukuran ${recommendation.size}, Tipe ${recommendation.type}.<br>`;
        response += `Lingkungan pemasangan: ${memory.environment}.<br>`;
      } else {
        response += `Maaf, tidak ada rekomendasi kabel yang sesuai dengan kriteria tersebut.<br>`;
      }
    }

    // Setelah memberikan rekomendasi, tanyakan apakah user ingin rekomendasi lain
    response += "Apakah Anda ingin rekomendasi lain? (ya/tidak)";
    awaitingNewRecommendation = true;
    addMessage(response, "bot");
  }

  // Event listener untuk tombol "Kirim"
  sendButton.addEventListener("click", function() {
    const text = userInput.value;
    if (text.trim() !== "") {
      addMessage(text, "user");
      userInput.value = "";
      processUserInput(text);
    }
  });

  // Kirim pesan saat tombol Enter ditekan
  userInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      sendButton.click();
    }
  });
});
