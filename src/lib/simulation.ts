export type SimulationQuestion = {
  id: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};
export const simulationQuestions: SimulationQuestion[] = [
  {
    id: "route-resource",
    category: "Routing",
    difficulty: "easy",
    question:
      "Route::resource('produk', ProductController::class) mendaftarkan apa?",
    options: [
      "Sekumpulan route CRUD standar",
      "Hanya route GET produk",
      "Tabel products otomatis",
      "Middleware autentikasi otomatis",
    ],
    answer: "Sekumpulan route CRUD standar",
    explanation:
      "Resource controller memetakan index, create, store, show, edit, update, dan destroy. Method controller tetap perlu diimplementasikan.",
  },
  {
    id: "route-binding",
    category: "Routing",
    difficulty: "medium",
    question:
      "Model produk pada route binding tidak ditemukan. Respons default yang tepat adalah?",
    options: [
      "404 Not Found",
      "200 dengan produk kosong",
      "Membuat produk baru",
      "301 menuju halaman edit",
    ],
    answer: "404 Not Found",
    explanation:
      "Implicit model binding mengembalikan 404 ketika model tidak ditemukan; tidak menyisipkan record baru.",
  },
  {
    id: "blade-escape",
    category: "Blade",
    difficulty: "easy",
    question:
      "Bagaimana menampilkan nama_produk dari pengguna dengan escaping bawaan Blade?",
    options: [
      "{{ $product->nama_produk }}",
      "{!! $product->nama_produk !!}",
      "<?php echo $product->nama_produk; ?>",
      "@php echo $product->nama_produk; @endphp",
    ],
    answer: "{{ $product->nama_produk }}",
    explanation:
      "Kurung kurawal ganda meng-escape HTML. Output mentah dapat menjalankan HTML tidak tepercaya.",
  },
  {
    id: "blade-csrf",
    category: "Blade",
    difficulty: "easy",
    question:
      "Direktif yang menyertakan token proteksi CSRF dalam form POST adalah?",
    options: ["@csrf", "@method('GET')", "@extends('csrf')", "@yield('token')"],
    answer: "@csrf",
    explanation:
      "@csrf menghasilkan input token tersembunyi untuk validasi request pada web middleware.",
  },
  {
    id: "blade-method",
    category: "Blade",
    difficulty: "medium",
    question:
      "Form HTML method POST perlu mengirim request DELETE ke resource route. Tambahan yang tepat?",
    options: [
      "@method('DELETE') dan @csrf",
      "@delete saja",
      "method='DELETE' tanpa spoofing",
      "@method('GET')",
    ],
    answer: "@method('DELETE') dan @csrf",
    explanation:
      "HTML form hanya mendukung GET/POST. Laravel menggunakan field _method dari @method untuk method spoofing.",
  },
  {
    id: "eloquent-fillable",
    category: "Eloquent",
    difficulty: "medium",
    question: "Apa fungsi $fillable pada model Product?",
    options: [
      "Membatasi atribut untuk mass assignment",
      "Memvalidasi seluruh request secara otomatis",
      "Membuat kolom database",
      "Mengenkripsi seluruh atribut",
    ],
    answer: "Membatasi atribut untuk mass assignment",
    explanation:
      "$fillable menentukan atribut yang boleh diisi secara massal. Validasi request dan migration tetap terpisah.",
  },
  {
    id: "eloquent-casts",
    category: "Eloquent",
    difficulty: "medium",
    question: "Cast harga menjadi integer pada model akan melakukan apa?",
    options: [
      "Mengubah representasi atribut saat diakses",
      "Mengubah tipe kolom melalui migration",
      "Membuat validasi min:0 otomatis",
      "Menolak semua angka negatif di database",
    ],
    answer: "Mengubah representasi atribut saat diakses",
    explanation:
      "Casting mengatur representasi nilai pada model. Constraint database dan validasi tetap harus didefinisikan.",
  },
  {
    id: "validation-price",
    category: "Validation",
    difficulty: "easy",
    question:
      "Aturan harga sesuai jobsheet: wajib, bilangan bulat, minimal nol?",
    options: [
      "required|integer|min:0",
      "nullable|string|max:0",
      "required|numeric|max:0",
      "required|integer|min:1",
    ],
    answer: "required|integer|min:0",
    explanation:
      "min:0 menerima nol dan menolak nilai negatif; integer menolak pecahan.",
  },
  {
    id: "validation-save",
    category: "Validation",
    difficulty: "hard",
    question:
      "Setelah $validated = $request->validate(...), data apa yang paling tepat diberikan ke Product::create()?",
    options: [
      "$validated",
      "$request->all()",
      "$_GET",
      "Seluruh session pengguna",
    ],
    answer: "$validated",
    explanation:
      "Simpan data yang telah melewati aturan validasi. Mass assignment tetap membutuhkan konfigurasi model yang benar.",
  },
  {
    id: "validation-name",
    category: "Validation",
    difficulty: "easy",
    question: "Nama produk sesuai jobsheet dibatasi dengan aturan apa?",
    options: [
      "required|string|max:100",
      "nullable|string|max:255",
      "required|integer|max:100",
      "required|string|min:100",
    ],
    answer: "required|string|max:100",
    explanation:
      "nama_produk wajib string maksimal 100 karakter, konsisten dengan spesifikasi tabel.",
  },
  {
    id: "testing-boundary",
    category: "Testing",
    difficulty: "medium",
    question:
      "Pasangan input yang paling relevan untuk menguji batas minimal harga nol?",
    options: [
      "-1 dan 0",
      "100 dan 200",
      "Produk A dan Produk B",
      "JPG dan PNG",
    ],
    answer: "-1 dan 0",
    explanation:
      "Boundary testing memeriksa nilai tepat di batas dan di luar batas. -1 harus gagal, 0 harus diterima.",
  },
  {
    id: "testing-evidence",
    category: "Testing",
    difficulty: "medium",
    question: "Sebelum menandai skenario lulus, bukti apa yang perlu dicatat?",
    options: [
      "Hasil aktual dan perbandingan dengan hasil yang diharapkan",
      "Hanya nama penguji",
      "Hanya kode controller",
      "Perkiraan hasil tanpa menjalankan aplikasi",
    ],
    answer: "Hasil aktual dan perbandingan dengan hasil yang diharapkan",
    explanation:
      "Status pengujian harus bisa ditelusuri ke eksekusi nyata, input, hasil aktual, dan bukti yang relevan.",
  },
];
export type ExamSession = {
  version: 1;
  deadline: number;
  order: string[];
  options: Record<string, number[]>;
  answers: Record<string, number>;
  finished: boolean;
};
export const EXAM_KEY = "educode:exam:v2";
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createExam(
  minutes: number,
  random = Math.random,
  now = Date.now(),
): ExamSession {
  return {
    version: 1,
    deadline: now + minutes * 60000,
    order: shuffle(
      simulationQuestions.map((q) => q.id),
      random,
    ),
    options: Object.fromEntries(
      simulationQuestions.map((q) => [
        q.id,
        shuffle(
          q.options.map((_, i) => i),
          random,
        ),
      ]),
    ),
    answers: {},
    finished: false,
  };
}
export function parseExam(text: string): ExamSession | null {
  try {
    const raw = JSON.parse(text) as ExamSession;
    if (
      !raw ||
      raw.version !== 1 ||
      !Number.isFinite(raw.deadline) ||
      raw.deadline <= 0 ||
      typeof raw.finished !== "boolean" ||
      !Array.isArray(raw.order) ||
      raw.order.length !== simulationQuestions.length ||
      new Set(raw.order).size !== raw.order.length ||
      !raw.options ||
      typeof raw.options !== "object" ||
      Array.isArray(raw.options) ||
      !raw.answers ||
      typeof raw.answers !== "object" ||
      Array.isArray(raw.answers)
    )
      return null;
    const options: Record<string, number[]> = {},
      answers: Record<string, number> = {};
    for (const id of raw.order) {
      const q = simulationQuestions.find((q) => q.id === id),
        indices = raw.options[id];
      if (
        !q ||
        !Array.isArray(indices) ||
        indices.length !== q.options.length ||
        new Set(indices).size !== indices.length ||
        indices.some(
          (i) => !Number.isInteger(i) || i < 0 || i >= q.options.length,
        )
      )
        return null;
      options[id] = indices;
      const answer = raw.answers[id];
      if (Number.isInteger(answer) && answer >= 0 && answer < q.options.length)
        answers[id] = answer;
    }
    return {
      version: 1,
      deadline: raw.deadline,
      order: raw.order,
      options,
      answers,
      finished: raw.finished,
    };
  } catch {
    return null;
  }
}
export function examResult(session: ExamSession) {
  const categories: Record<string, { correct: number; total: number }> = {};
  let score = 0;
  for (const id of session.order) {
    const q = simulationQuestions.find((q) => q.id === id)!;
    const correct = q.options[session.answers[id]] === q.answer ? 1 : 0;
    score += correct;
    categories[q.category] ??= { correct: 0, total: 0 };
    categories[q.category].correct += correct;
    categories[q.category].total++;
  }
  const total = session.order.length;
  return {
    score,
    total,
    percentage: total ? Math.round((score / total) * 100) : 0,
    categories,
  };
}
