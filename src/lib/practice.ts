export type Exercise = {
  id: string;
  kind: "fill" | "repair";
  topic: string;
  title: string;
  prompt: string;
  code: string;
  answer: string;
  alternatives?: string[];
  hint: string;
  explanation: string;
};
export function nextSeed(previous: number): number {
  return Number.isSafeInteger(previous) &&
    previous >= 0 &&
    previous < 2147483646
    ? previous + 1
    : 1;
}
export function matchesAnswer(answer: string, exercise: Exercise): boolean {
  // Normalize only outer whitespace and line endings; spaces inside strings are meaningful.
  const clean = (value: string) => value.trim().replace(/\r\n/g, "\n");
  return [exercise.answer, ...(exercise.alternatives || [])].some(
    (value) => clean(value) === clean(answer),
  );
}
export function makeExercises(seed: number): Exercise[] {
  const price = 1000 + (seed % 997) * 100,
    qty = 2 + (seed % 8);
  const id = 1 + (seed % 997);
  const word = ["Sanger", "Arabika", "Robusta", "Espresso", "Kopi Aceh"][
    seed % 5
  ];
  const make = (
    key: string,
    kind: Exercise["kind"],
    topic: string,
    title: string,
    prompt: string,
    code: string,
    answer: string,
    hint: string,
    explanation: string,
    alternatives?: string[],
  ): Exercise => ({
    id: `${seed}:${key}`,
    kind,
    topic,
    title,
    prompt,
    code,
    answer,
    hint,
    explanation,
    alternatives,
  });
  const fill = [
    make(
      "subtotal",
      "fill",
      "JavaScript",
      "Hitung subtotal",
      "Ganti ___ dengan nilai subtotal numerik.",
      `const harga = ${price};\nconst jumlah = ${qty};\nconst subtotal = ___;`,
      String(price * qty),
      "Kalikan harga dengan jumlah.",
      `${price} × ${qty} = ${price * qty}. Harga disimpan sebagai bilangan bulat.`,
    ),
    make(
      "find",
      "fill",
      "Eloquent",
      "Cari produk atau 404",
      "Isi nama method yang langsung memberi 404 jika ID tidak ditemukan.",
      `$produk = Product::___(${id});`,
      "findOrFail",
      "Gunakan varian find yang gagal dengan exception.",
      "findOrFail mencegah pemakaian model null dan menghasilkan respons 404.",
    ),
    make(
      "where",
      "fill",
      "Eloquent",
      "Batasi harga",
      "Isi operator agar produk dengan harga sama dengan batas juga termasuk.",
      `Product::where('harga', '___', ${price})->get();`,
      "<=",
      "Batas bersifat inklusif.",
      "Operator <= mencakup harga yang lebih rendah maupun sama dengan batas.",
    ),
    make(
      "blade",
      "fill",
      "Blade",
      "Tampilkan data aman",
      "Isi nama field produk yang digunakan jobsheet.",
      `{{-- Produk: ${word} --}}\n<h2>{{ $produk->___ }}</h2>`,
      "nama_produk",
      "Field ini terdiri dari dua kata dengan underscore.",
      "{{ }} melakukan escaping HTML; field nama_produk sesuai skema products.",
    ),
    make(
      "update",
      "fill",
      "Eloquent",
      "Simpan hasil validasi",
      "Isi nama method untuk memperbarui model yang sudah ada.",
      `$produk = Product::findOrFail(${id});\n$produk->___($validated);`,
      "update",
      "Jangan membuat record baru.",
      "update mengubah record yang ditemukan. Pastikan $validated berasal dari validasi request.",
    ),
    make(
      "count",
      "fill",
      "JavaScript",
      "Jumlah baris produk",
      "Isi properti array untuk mengetahui jumlah elemen.",
      `const ids = [${id}, ${id + 1}, ${id + 2}];\nconst jumlah = ids.___;`,
      "length",
      "Properti, bukan pemanggilan fungsi.",
      "Array.length menghasilkan jumlah elemen, di sini 3.",
    ),
    make(
      "route",
      "fill",
      "Laravel",
      "Buat URL edit",
      "Isi nama route resource untuk halaman edit.",
      `route('___', ${id});`,
      "produk.edit",
      "Nama resource produk diikuti nama aksi.",
      "Resource route menggunakan produk.edit untuk form edit, dan produk.update untuk penyimpanan.",
    ),
    make(
      "format",
      "fill",
      "PHP",
      "Format harga rupiah",
      "Isi fungsi PHP untuk memformat angka.",
      `echo ___(${price}, 0, ',', '.');`,
      "number_format",
      "Nama fungsi terdiri dari number dan format.",
      "number_format hanya mengatur tampilan; nilai database tetap integer.",
    ),
  ];
  const repair = [
    make(
      "multiply",
      "repair",
      "JavaScript",
      "Perbaiki subtotal",
      "Ganti seluruh baris. Total harus harga × jumlah, bukan penjumlahan.",
      `const total = ${price} + ${qty};`,
      `const total = ${price} * ${qty};`,
      "Ganti operator aritmetika.",
      "Penjumlahan harga dan jumlah mencampur dua satuan. Gunakan perkalian.",
    ),
    make(
      "price",
      "repair",
      "Laravel",
      "Tolak harga negatif",
      "Ganti seluruh aturan harga sesuai jobsheet: wajib, integer, minimal nol.",
      `'harga' => 'required|integer|min:-${id}',`,
      "'harga' => 'required|integer|min:0',",
      "Harga nol valid; harga negatif tidak.",
      "Aturan min:0 melindungi data dari harga negatif. Validasi ini wajib di server.",
    ),
    make(
      "escape",
      "repair",
      "Blade",
      "Hindari HTML mentah",
      "Ganti baris dengan escaped echo Blade untuk nama produk dari pengguna.",
      `{!! $produk->nama_produk !!} {{-- ${word} --}}`,
      "{{ $produk->nama_produk }}",
      "Gunakan kurung kurawal ganda; komentar tidak perlu disertakan.",
      "Escaped echo mencegah nama produk diinterpretasikan sebagai markup HTML.",
    ),
    make(
      "record",
      "repair",
      "Eloquent",
      "Tangani ID tidak ada",
      "Ganti baris dengan findOrFail agar produk yang tidak ada menghasilkan 404.",
      `$produk = Product::find(${id});`,
      `$produk = Product::findOrFail(${id});`,
      "Nama method menyatakan kegagalan jika model tidak ditemukan.",
      "find dapat mengembalikan null. findOrFail menggunakan penanganan 404 Laravel.",
    ),
    make(
      "type",
      "repair",
      "JavaScript",
      "Jumlahkan harga numerik",
      "Ganti baris agar total bertipe number. Pertahankan tanda kutip dan gunakan Number pada string pertama.",
      `const total = '${price}' + ${price + 1000};`,
      `const total = Number('${price}') + ${price + 1000};`,
      "Operator + pada string melakukan penggabungan teks.",
      "Konversi string dengan Number sebelum melakukan penjumlahan.",
    ),
    make(
      "delete",
      "repair",
      "Laravel",
      "Route hapus yang tepat",
      "Ganti baris menjadi URL aksi destroy pada resource produk.",
      `route('produk.edit', ${id});`,
      `route('produk.destroy', ${id});`,
      "Gunakan nama aksi destroy.",
      "Form penghapusan menuju produk.destroy dengan method DELETE dan token CSRF.",
    ),
    make(
      "query",
      "repair",
      "Eloquent",
      "Eksekusi query",
      "Tambahkan get() pada akhir query agar hasilnya menjadi koleksi model.",
      `$products = Product::where('harga', '<=', ${price});`,
      `$products = Product::where('harga', '<=', ${price})->get();`,
      "Query builder belum menjadi hasil sampai dieksekusi.",
      "get() mengambil koleksi. Builder tetap dapat ditambah kondisi sebelum get().",
    ),
    make(
      "strict",
      "repair",
      "JavaScript",
      "Bandingkan tanpa assignment",
      "Ganti operator = dengan ===. Pertahankan seluruh bagian lain.",
      `const cocok = (harga = ${price});`,
      `const cocok = (harga === ${price});`,
      "Tiga tanda sama dengan membandingkan nilai dan tipe.",
      "Assignment mengubah harga. Strict equality menghasilkan boolean tanpa mutasi.",
    ),
  ];
  // Rotate both families, then interleave. Consecutive seeds have different first templates and parameters.
  return Array.from({ length: 6 }, (_, index) => [
    fill[(seed + index) % fill.length],
    repair[(seed * 3 + index) % repair.length],
  ]).flat();
}
