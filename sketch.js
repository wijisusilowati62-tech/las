/* ==============================================================================
 * SIMULASI LABORATORIUM VIRTUAL: LISTRIK ARUS SEARAH (DC)
 * Dibuat menggunakan Pustaka p5.js
 * Fitur: Multi-submateri, Elemen Interaktif (Slider, Button, Dropdown, Checkbox),
 *        Animasi Aliran Elektron, dan Tabel Pengamatan Interaktif.
 * ============================================================================== */

// ------------------------------------------------------------------------------
// 1. INISIALISASI VARIABEL GLOBAL
// ------------------------------------------------------------------------------
let subMateriSelect; // Dropdown pemilih sub-materi
let slider1, slider2, slider3; // Slider kontrol parameter fisika
let chkElectron; // Checkbox toggle animasi elektron
let btnReset; // Tombol reset parameter
let inputTabel = []; // Array penampung input tabel pengamatan
let inputKesimpulan; // Input box untuk kesimpulan/saran

let electronOffset = 0; // Offset animasi pergerakan elektron

// Palette Warna Lab Virtual (Biru Laut, Pink, Kuning, Orange, Putih Clean)
let colBg, colCard, colBlue, colPink, colYellow, colOrange, colText;

function setup() {
  // Membuat Canvas p5.js dengan ukuran 760 x 360 pixel
  let cvs = createCanvas(760, 360);
  cvs.position(20, 200); // Mengatur posisi canvas di bawah kontrol UI

  // Inisialisasi Palette Warna Futuristik
  colBg = color(15, 23, 42);       // Biru Laut Gelap
  colCard = color(30, 41, 59);     // Biru Laut Sedang
  colBlue = color(2, 132, 199);    // Biru Laut Cerah
  colPink = color(236, 72, 153);   // Pink Estetik
  colYellow = color(250, 204, 21);  // Kuning Cerah
  colOrange = color(249, 115, 22); // Orange Energi
  colText = color(248, 250, 252);  // Putih Clean

  // ----------------------------------------------------------------------------
  // 2. PEMBUATAN ELEMEN KONTROL UI (p5.DOM)
  // ----------------------------------------------------------------------------
  
  // Header Judul Lab Virtual
  let title = createDiv("⚡ VIRTUAL LAB: LISTRIK ARUS SEARAH (DC) ⚡");
  title.position(20, 10);
  title.style("font-family", "sans-serif");
  title.style("font-size", "22px");
  title.style("font-weight", "bold");
  title.style("color", "#facc15");

  // Dropdown Pemilihan Sub-Materi
  createSpan(" Pilihan Sub-Materi: ").position(20, 50).style("color", "black").style("font-family", "sans-serif");
  subMateriSelect = createSelect();
  subMateriSelect.position(170, 48);
  subMateriSelect.option("1. Hukum Ohm (V = I x R)", "ohm");
  subMateriSelect.option("2. Hambatan Jenis Kawat (R = ρ·L/A)", "kawat");
  subMateriSelect.option("3. Rangkaian Lampu Seri & Paralel", "seri_paralel");
  subMateriSelect.option("4. Hukum I Kirchhoff (ΣI_masuk = ΣI_keluar)", "kirchhoff");
  subMateriSelect.changed(updateSubMateri);

  // Slider 1, 2, dan 3 untuk penyesuaian parameter fisika
  slider1 = createSlider(1, 24, 9, 0.5);
  slider1.position(20, 110);
  
  slider2 = createSlider(1, 100, 10, 1);
  slider2.position(260, 110);

  slider3 = createSlider(1, 50, 5, 0.5);
  slider3.position(500, 110);

  // Checkbox Tampilkan Aliran Elektron
  chkElectron = createCheckbox(" Tampilkan Aliran Elektron", true);
  chkElectron.position(20, 150);
  chkElectron.style("color", "#ec4899");
  chkElectron.style("font-family", "sans-serif");

  // Tombol Reset Simulasi
  btnReset = createButton("🔄 Reset Parameter");
  btnReset.position(300, 150);
  btnReset.style("background-color", "#f97316");
  btnReset.style("color", "#ffffff");
  btnReset.style("border", "none");
  btnReset.style("padding", "6px 12px");
  btnReset.style("border-radius", "4px");
  btnReset.style("cursor", "pointer");
  btnReset.mousePressed(resetSimulasi);

  // ----------------------------------------------------------------------------
  // 3. PEMBUATAN TABEL PENGAMATAN & INPUT KESIMPULAN (DOM)
  // ----------------------------------------------------------------------------
  let yTable = 580;
  let lblTabel = createDiv("📝 TABEL PENGAMATAN EXPERIMEN SISWA");
  lblTabel.position(20, yTable);
  lblTabel.style("color", "#facc15").style("font-weight", "bold").style("font-family", "sans-serif");

  // Format Baris Tabel Pengamatan (3 Baris Input Data)
  for (let i = 0; i < 3; i++) {
    let rowY = yTable + 30 + (i * 35);
    createSpan(`Data ${i+1}: `).position(20, rowY).style("color", "#fff").style("font-family", "sans-serif");
    
    let inp1 = createInput("").attribute("placeholder", "Variabel 1 (Tegangan/ρ)").position(80, rowY).size(180);
    let inp2 = createInput("").attribute("placeholder", "Variabel 2 (Hambatan/L)").position(270, rowY).size(180);
    let inp3 = createInput("").attribute("placeholder", "Hasil Arus (I) / R Total").position(460, rowY).size(180);
    
    inputTabel.push({ inp1, inp2, inp3 });
  }

  // Textarea Kesimpulan dan Saran
  let lblKes = createDiv("💡 Kesimpulan & Saran Eksperimen:");
  lblKes.position(20, yTable + 150).style("color", "#ec4899").style("font-weight", "bold").style("font-family", "sans-serif");
  
  inputKesimpulan = createElement("textarea");
  inputKesimpulan.position(20, yTable + 175);
  inputKesimpulan.size(620, 60);
  inputKesimpulan.attribute("placeholder", "Tuliskan hasil analisis dan kesimpulan Anda di sini...");

  let btnSimpan = createButton("💾 Simpan Laporan");
  btnSimpan.position(650, yTable + 175);
  btnSimpan.style("background-color", "#0284c7").style("color", "#fff").style("padding", "10px").style("border-radius", "5px");
  btnSimpan.mousePressed(() => alert("Laporan eksperimen berhasil disimpan!"));

  // Panggil update pertama kali
  updateSubMateri();
}

// ------------------------------------------------------------------------------
// 4. LOOPING DRAW (VISUALISASI & PERHITUNGAN FISIKA)
// ------------------------------------------------------------------------------
function draw() {
  background(colBg); // Warna dasar canvas

  // Pembacaan Sub-Materi Aktif
  let mode = subMateriSelect.value();

  // Menampilkan Label Parameter di Atas Slider
  fill(colYellow);
  textSize(12);
  textAlign(LEFT);
  
  if (mode === "ohm") {
    text(`Tegangan (V): ${slider1.value()} Volt`, 20, 100);
    text(`Hambatan (R): ${slider2.value()} Ohm`, 260, 100);
    drawHukumOhm();
  } else if (mode === "kawat") {
    text(`Hambatan Jenis (ρ): ${slider1.value()} Ω·m`, 20, 100);
    text(`Panjang Kawat (L): ${slider2.value()} m`, 260, 100);
    text(`Luas Penampang (A): ${slider3.value()} mm²`, 500, 100);
    drawHambatanKawat();
  } else if (mode === "seri_paralel") {
    text(`Tegangan Sumber (V): ${slider1.value()} Volt`, 20, 100);
    text(`Hambatan Lampu 1 (R1): ${slider2.value()} Ω`, 260, 100);
    text(`Hambatan Lampu 2 (R2): ${slider3.value()} Ω`, 500, 100);
    drawSeriParalel();
  } else if (mode === "kirchhoff") {
    text(`Arus Masuk 1 (I1): ${slider1.value()} A`, 20, 100);
    text(`Arus Masuk 2 (I2): ${slider2.value()} A`, 260, 100);
    text(`Arus Keluar 1 (I3): ${slider3.value()} A`, 500, 100);
    drawHukumKirchhoff();
  }
}

// ------------------------------------------------------------------------------
// 5. SIMULASI SUB-MATERI 1: HUKUM OHM
// ------------------------------------------------------------------------------
function drawHukumOhm() {
  let V = slider1.value();
  let R = slider2.value();
  let I = V / R; // Rumus Hukum Ohm: I = V / R

  // Keterangan Judul Simulasi
  fill(colText);
  textSize(16);
  text("Simulasi Rangkaian Sederhana Hukum Ohm", 20, 30);

  // Kawat Rangkaian (Persegi)
  stroke(colBlue);
  strokeWeight(4);
  noFill();
  rect(150, 60, 420, 200, 10);

  // Gambar Baterai (Sumber Tegangan V)
  strokeWeight(2); stroke(255); fill(colCard);
  rect(130, 130, 40, 60, 5);
  fill(colPink); rect(140, 120, 20, 10, 2);
  fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(12);
  text(V + "V", 150, 160);

  // Gambar Resistor (Hambatan R)
  stroke(colOrange); strokeWeight(3); fill(colCard);
  rect(320, 45, 80, 30, 4);
  fill(colOrange); noStroke();
  text(R + " Ω", 360, 60);

  // Gambar Amperemeter (Pengukur Arus I)
  stroke(colPink); fill(colBg);
  ellipse(570, 160, 50, 50);
  fill(colPink); noStroke(); textSize(11);
  text("Ammeter", 570, 148);
  textSize(12);
  text(I.toFixed(2) + " A", 570, 168);

  // Animasi Bergerak Aliran Elektron (Warna Kuning)
  if (chkElectron.checked() && I > 0) {
    electronOffset += I * 1.5;
    fill(colYellow); noStroke();
    let pts = [
      {x1:150, y1:60, x2:570, y2:60},
      {x1:570, y1:60, x2:570, y2:260},
      {x1:570, y1:260, x2:150, y2:260},
      {x1:150, y1:260, x2:150, y2:60}
    ];
    for (let p of pts) {
      let d = dist(p.x1, p.y1, p.x2, p.y2);
      for (let i = 0; i < d; i += 30) {
        let step = (i + electronOffset) % d;
        let x = lerp(p.x1, p.x2, step / d);
        let y = lerp(p.y1, p.y2, step / d);
        ellipse(x, y, 6, 6);
      }
    }
  }

  // Display Box Hasil Perhitungan
  fill(colCard); stroke(colBlue);
  rect(20, 290, 720, 50, 8);
  fill(colText); noStroke(); textAlign(LEFT, CENTER); textSize(14);
  text(`Persamaan: I = V / R  ==>  Arus (I) = ${V} Volt / ${R} Ohm = ${I.toFixed(3)} Ampere`, 40, 315);
}

// ------------------------------------------------------------------------------
// 6. SIMULASI SUB-MATERI 2: HAMBATAN JENIS KAWAT
// ------------------------------------------------------------------------------
function drawHambatanKawat() {
  let rho = slider1.value();
  let L = slider2.value();
  let A = slider3.value();
  let R = (rho * L) / A; // Rumus: R = (ρ * L) / A

  fill(colText); textSize(16); text("Simulasi Karakteristik Kawat Penghantar", 20, 30);

  // Gambar Visual Kawat
  let startX = 80;
  let startY = 150;
  let wireL = map(L, 1, 100, 100, 550);
  let wireR = map(A, 1, 50, 8, 35);

  stroke(colOrange); fill(2, 132, 199, 150);
  rect(startX, startY - wireR, wireL, wireR * 2, 6);

  // Atom Penghambat di Dalam Kawat
  fill(colPink); noStroke();
  let numAtoms = floor(rho * 4);
  for (let i = 0; i < numAtoms; i++) {
    let ax = startX + (i * 20) % wireL;
    let ay = startY + ((i * 11) % (wireR * 2)) - wireR;
    ellipse(ax + 10, ay, 6, 6);
  }

  // Display Box Hasil Perhitungan R
  fill(colCard); stroke(colBlue);
  rect(20, 280, 720, 60, 8);
  fill(colText); noStroke(); textAlign(LEFT, CENTER); textSize(14);
  text(`Rumus: R = (ρ × L) / A`, 40, 300);
  text(`Hambatan Total (R) = (${rho} × ${L}) / ${A} = ${R.toFixed(3)} Ω (Ohm)`, 40, 322);
}

// ------------------------------------------------------------------------------
// 7. SIMULASI SUB-MATERI 3: RANGKAIAN SERI & PARALEL
// ------------------------------------------------------------------------------
function drawSeriParalel() {
  let V = slider1.value();
  let R1 = slider2.value();
  let R2 = slider3.value();

  fill(colText); textSize(16); text("Rangkaian Lampu: Seri (Kiri) vs Paralel (Kanan)", 20, 30);

  // --- RANGKAIAN SERI ---
  let R_seri = R1 + R2;
  let I_seri = V / R_seri;

  stroke(colBlue); strokeWeight(3); noFill();
  rect(30, 60, 320, 180, 8);
  drawLampu(110, 60, I_seri * 8, "L1: " + R1 + "Ω");
  drawLampu(250, 60, I_seri * 8, "L2: " + R2 + "Ω");

  fill(colText); noStroke(); textAlign(CENTER); textSize(12);
  text(`SERI: R_tot = ${R_seri.toFixed(1)} Ω | I = ${I_seri.toFixed(2)} A`, 190, 260);

  // --- RANGKAIAN PARALEL ---
  let R_paralel = (R1 * R2) / (R1 + R2);
  let I1 = V / R1;
  let I2 = V / R2;

  stroke(colPink); strokeWeight(3); noFill();
  rect(400, 60, 320, 180, 8);
  line(480, 60, 480, 240);
  line(640, 60, 640, 240);

  drawLampu(560, 100, I1 * 8, "L1: " + R1 + "Ω");
  drawLampu(560, 200, I2 * 8, "L2: " + R2 + "Ω");

  fill(colText); noStroke(); textAlign(CENTER); textSize(12);
  text(`PARALEL: R_tot = ${R_paralel.toFixed(1)} Ω | I_tot = ${(I1+I2).toFixed(2)} A`, 560, 260);
}

// Fungsi Bantu Menggambar Komponen Lampu
function drawLampu(x, y, brightness, label) {
  push();
  noStroke();
  let glowSize = constrain(brightness * 3, 0, 60);
  fill(250, 204, 21, map(glowSize, 0, 60, 0, 180));
  ellipse(x, y, 25 + glowSize, 25 + glowSize);

  stroke(255); fill(glowSize > 5 ? colYellow : color(100));
  ellipse(x, y, 22, 22);
  fill(colText); noStroke(); textSize(11); textAlign(CENTER);
  text(label, x, y - 18);
  pop();
}

// ------------------------------------------------------------------------------
// 8. SIMULASI SUB-MATERI 4: HUKUM I KIRCHHOFF
// ------------------------------------------------------------------------------
function drawHukumKirchhoff() {
  let I1 = slider1.value();
  let I2 = slider2.value();
  let I3_out = slider3.value();
  let I4_out = (I1 + I2) - I3_out; // ΣI_masuk = ΣI_keluar

  fill(colText); textSize(16); text("Simulasi Hukum I Kirchhoff pada Percabangan", 20, 30);

  let nodeX = 380, nodeY = 150;

  // Cabang Arus Masuk
  stroke(colBlue); strokeWeight(map(I1, 1, 24, 2, 7));
  line(180, 70, nodeX, nodeY);
  strokeWeight(map(I2, 1, 24, 2, 7));
  line(180, 230, nodeX, nodeY);

  // Cabang Arus Keluar
  stroke(colPink); strokeWeight(map(I3_out, 1, 50, 2, 7));
  line(nodeX, nodeY, 580, 70);
  strokeWeight(max(1, map(I4_out, 0, 50, 1, 7)));
  line(nodeX, nodeY, 580, 230);

  // Titik Percabangan
  fill(colOrange); noStroke(); ellipse(nodeX, nodeY, 18, 18);

  // Label Arus
  fill(colBlue); textAlign(RIGHT);
  text(`I1 (Masuk) = ${I1} A`, 170, 70);
  text(`I2 (Masuk) = ${I2} A`, 170, 230);

  fill(colPink); textAlign(LEFT);
  text(`I3 (Keluar) = ${I3_out} A`, 590, 70);
  text(`I4 (Keluar) = ${I4_out.toFixed(2)} A`, 590, 230);

  // Box Informasi
  fill(colCard); stroke(colYellow);
  rect(20, 280, 720, 60, 8);
  fill(colText); noStroke(); textAlign(LEFT, CENTER); textSize(13);
  text(`Persamaan Kirchhoff: Σ I_masuk = Σ I_keluar`, 40, 298);
  text(`(${I1} A + ${I2} A) = (${I3_out} A + I4)  ==>  I4 = ${(I1+I2)} - ${I3_out} = ${I4_out.toFixed(2)} A`, 40, 320);
}

// ------------------------------------------------------------------------------
// 9. UTILITY & EVENT HANDLER
// ------------------------------------------------------------------------------
function updateSubMateri() {
  let mode = subMateriSelect.value();
  if (mode === "ohm") {
    slider1.attribute("min", "1").attribute("max", "24").attribute("step", "0.5").value(9);
    slider2.attribute("min", "1").attribute("max", "100").attribute("step", "1").value(10);
    slider3.hide();
  } else if (mode === "kawat") {
    slider1.attribute("min", "1").attribute("max", "10").attribute("step", "0.5").value(2);
    slider2.attribute("min", "1").attribute("max", "100").attribute("step", "1").value(50);
    slider3.show().attribute("min", "1").attribute("max", "50").attribute("step", "1").value(10);
  } else if (mode === "seri_paralel") {
    slider1.attribute("min", "3").attribute("max", "24").attribute("step", "1").value(12);
    slider2.attribute("min", "2").attribute("max", "50").attribute("step", "1").value(10);
    slider3.show().attribute("min", "2").attribute("max", "50").attribute("step", "1").value(10);
  } else if (mode === "kirchhoff") {
    slider1.attribute("min", "1").attribute("max", "20").attribute("step", "1").value(5);
    slider2.attribute("min", "1").attribute("max", "20").attribute("step", "1").value(7);
    slider3.show().attribute("min", "1").attribute("max", "30").attribute("step", "1").value(4);
  }
}

function resetSimulasi() {
  slider1.value(slider1.attribute("min"));
  slider2.value(slider2.attribute("min"));
  slider3.value(slider3.attribute("min"));
  electronOffset = 0;
}