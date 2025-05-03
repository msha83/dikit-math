import { supabase } from '../config/supabase';

// Data kategori flashcard dari data contoh
const categories = [
  { name: 'Aljabar' },
  { name: 'Geometri' },
];

// Data topik/subcategories flashcard dari halaman Flashcard.jsx
const topics = [
  { name: 'Persamaan Linear', category_name: 'Aljabar' },
  { name: 'Persamaan Kuadrat', category_name: 'Aljabar' },
  { name: 'Fungsi dan Grafik', category_name: 'Aljabar' },
  { name: 'Bangun Datar', category_name: 'Geometri' },
  { name: 'Bangun Ruang', category_name: 'Geometri' },
  { name: 'Trigonometri', category_name: 'Geometri' },
];

// Data flashcard dari contoh
const flashcards = [
  {
    question: "Apa yang dimaksud dengan persamaan linear?",
    answer: "Persamaan linear adalah persamaan yang variabelnya berpangkat satu. Bentuk umumnya adalah ax + b = 0, di mana a ≠ 0.",
    topic_name: "Persamaan Linear",
    difficulty: 1
  },
  {
    question: "Bagaimana ciri-ciri persamaan linear?",
    answer: "Ciri-ciri persamaan linear: (1) Variabel berpangkat satu, (2) Tidak ada perkalian antar variabel, (3) Grafiknya berupa garis lurus.",
    topic_name: "Persamaan Linear",
    difficulty: 1
  },
  {
    question: "Apa yang dimaksud dengan koefisien pada persamaan linear?",
    answer: "Koefisien adalah bilangan yang menyertai variabel. Pada persamaan ax + b = 0, a adalah koefisien dari x.",
    topic_name: "Persamaan Linear",
    difficulty: 1
  },
  {
    question: "Bagaimana langkah-langkah umum untuk menyelesaikan persamaan linear?",
    answer: "1. Sederhanakan kedua ruas persamaan\n2. Pisahkan suku yang mengandung variabel ke satu ruas\n3. Pisahkan konstanta ke ruas lainnya\n4. Bagi kedua ruas dengan koefisien variabel\n5. Verifikasi jawaban",
    topic_name: "Persamaan Linear",
    difficulty: 2
  },
  {
    question: "Bagaimana cara menyelesaikan persamaan linear 3x + 5 = 2x - 1?",
    answer: "3x + 5 = 2x - 1\n3x - 2x = -1 - 5\nx = -6",
    topic_name: "Persamaan Linear",
    difficulty: 2
  },
  {
    question: "Apa itu persamaan kuadrat?",
    answer: "Persamaan kuadrat adalah persamaan polinomial orde dua dalam bentuk ax² + bx + c = 0, di mana a ≠ 0 dan a, b, c adalah konstanta.",
    topic_name: "Persamaan Kuadrat",
    difficulty: 1
  },
  {
    question: "Apa itu diskriminan dalam persamaan kuadrat?",
    answer: "Diskriminan adalah nilai b² - 4ac yang menentukan jenis akar-akar persamaan kuadrat.",
    topic_name: "Persamaan Kuadrat",
    difficulty: 2
  },
  {
    question: "Apa rumus akar-akar persamaan kuadrat?",
    answer: "Rumus akar-akar persamaan kuadrat ax² + bx + c = 0 adalah x = (-b ± √(b² - 4ac)) / 2a",
    topic_name: "Persamaan Kuadrat",
    difficulty: 2
  },
  {
    question: "Apa yang dimaksud dengan fungsi?",
    answer: "Fungsi adalah aturan yang menghubungkan setiap elemen dari satu himpunan (domain) dengan tepat satu elemen dari himpunan lain (kodomain).",
    topic_name: "Fungsi dan Grafik",
    difficulty: 1
  },
  {
    question: "Apa yang dimaksud dengan domain fungsi?",
    answer: "Domain adalah himpunan semua nilai input yang mungkin dari sebuah fungsi.",
    topic_name: "Fungsi dan Grafik", 
    difficulty: 1
  },
  {
    question: "Bagaimana bentuk umum fungsi linear?",
    answer: "Bentuk umum fungsi linear adalah f(x) = mx + c, di mana m adalah gradien dan c adalah titik potong dengan sumbu y.",
    topic_name: "Fungsi dan Grafik",
    difficulty: 1
  },
  {
    question: "Rumus luas lingkaran adalah?",
    answer: "πr². Dimana r adalah jari-jari lingkaran dan π adalah konstanta dengan nilai sekitar 3,14.",
    topic_name: "Bangun Datar",
    difficulty: 1
  },
  {
    question: "Rumus keliling lingkaran adalah?",
    answer: "2πr. Dimana r adalah jari-jari lingkaran dan π adalah konstanta dengan nilai sekitar 3,14.",
    topic_name: "Bangun Datar",
    difficulty: 1
  },
  {
    question: "Apa itu bilangan prima?",
    answer: "Bilangan prima adalah bilangan asli yang lebih besar dari 1 dan hanya bisa dibagi oleh 1 dan dirinya sendiri.",
    topic_name: "Persamaan Linear",
    difficulty: 1
  },
];

// Fungsi untuk migrasi data ke Supabase
export const migrateFlashcardsToSupabase = async () => {
  console.log('Mulai migrasi flashcards ke Supabase...');
  
  try {
    // 1. Buat tabel jika belum ada
    await createTablesIfNotExist();
    
    // 2. Tambahkan kategori
    const categoryMap = await migrateCategories();
    
    // 3. Tambahkan topik
    const topicMap = await migrateTopics(categoryMap);
    
    // 4. Tambahkan flashcards
    await migrateFlashcardData(topicMap);
    
    console.log('Migrasi selesai!');
    return { success: true, message: 'Migrasi data flashcard berhasil' };
    
  } catch (error) {
    console.error('Error saat migrasi:', error);
    return { success: false, message: error.message };
  }
};

// Fungsi untuk membuat tabel jika belum ada
const createTablesIfNotExist = async () => {
  // Periksa apakah tabel flashcard_categories ada
  const { error: errorCategories } = await supabase
    .from('flashcard_categories')
    .select('count', { count: 'exact', head: true });
  
  if (errorCategories && errorCategories.code === '42P01') {
    // Tabel tidak ada, buat tabel
    console.log('Membuat tabel flashcard_categories...');
    
    // Ini hanya simulasi, dalam praktiknya Anda perlu akses SQL langsung
    console.warn('Tabel flashcard_categories tidak ditemukan. Silakan buat melalui Supabase dashboard');
  }
  
  // Periksa apakah tabel flashcard_topics ada
  const { error: errorTopics } = await supabase
    .from('flashcard_topics')
    .select('count', { count: 'exact', head: true });
  
  if (errorTopics && errorTopics.code === '42P01') {
    console.log('Membuat tabel flashcard_topics...');
    console.warn('Tabel flashcard_topics tidak ditemukan. Silakan buat melalui Supabase dashboard');
  }
  
  // Periksa apakah tabel flashcards ada
  const { error: errorFlashcards } = await supabase
    .from('flashcards')
    .select('count', { count: 'exact', head: true });
  
  if (errorFlashcards && errorFlashcards.code === '42P01') {
    console.log('Membuat tabel flashcards...');
    console.warn('Tabel flashcards tidak ditemukan. Silakan buat melalui Supabase dashboard');
  }
};

// Fungsi untuk migrasi kategori
const migrateCategories = async () => {
  console.log('Migrasi kategori...');
  const categoryMap = {};
  
  for (const category of categories) {
    // Periksa apakah kategori sudah ada
    const { data: existingCategory, error: errorChecking } = await supabase
      .from('flashcard_categories')
      .select('id, name')
      .eq('name', category.name)
      .single();
    
    if (errorChecking && errorChecking.code !== 'PGRST116') {
      throw new Error(`Error saat memeriksa kategori ${category.name}: ${errorChecking.message}`);
    }
    
    if (existingCategory) {
      console.log(`Kategori ${category.name} sudah ada dengan id ${existingCategory.id}`);
      categoryMap[category.name] = existingCategory.id;
    } else {
      // Tambahkan kategori baru
      const { data: newCategory, error: errorInserting } = await supabase
        .from('flashcard_categories')
        .insert([{ name: category.name }])
        .select();
      
      if (errorInserting) {
        throw new Error(`Error saat menambahkan kategori ${category.name}: ${errorInserting.message}`);
      }
      
      console.log(`Kategori ${category.name} ditambahkan dengan id ${newCategory[0].id}`);
      categoryMap[category.name] = newCategory[0].id;
    }
  }
  
  return categoryMap;
};

// Fungsi untuk migrasi topik
const migrateTopics = async (categoryMap) => {
  console.log('Migrasi topik...');
  const topicMap = {};
  
  // Periksa apakah tabel flashcard_topics ada
  const { error: errorTopics } = await supabase
    .from('flashcard_topics')
    .select('count', { count: 'exact', head: true });
  
  if (errorTopics && errorTopics.code === '42P01') {
    console.warn('Tabel flashcard_topics tidak ditemukan. Membuat tabel...');
    // Dalam praktiknya, Anda perlu membuat tabel melalui SQL atau Supabase dashboard
    throw new Error('Tabel flashcard_topics tidak ada. Buat tabel terlebih dahulu melalui Supabase dashboard');
  }
  
  for (const topic of topics) {
    const categoryId = categoryMap[topic.category_name];
    
    if (!categoryId) {
      console.warn(`Kategori ${topic.category_name} tidak ditemukan untuk topik ${topic.name}`);
      continue;
    }
    
    // Periksa apakah topik sudah ada
    const { data: existingTopic, error: errorChecking } = await supabase
      .from('flashcard_topics')
      .select('id, name')
      .eq('name', topic.name)
      .eq('category_id', categoryId)
      .single();
    
    if (errorChecking && errorChecking.code !== 'PGRST116') {
      throw new Error(`Error saat memeriksa topik ${topic.name}: ${errorChecking.message}`);
    }
    
    if (existingTopic) {
      console.log(`Topik ${topic.name} sudah ada dengan id ${existingTopic.id}`);
      topicMap[topic.name] = existingTopic.id;
    } else {
      // Slug untuk URL
      const slug = topic.name.toLowerCase().replace(/\s+/g, '-');
      
      // Tambahkan topik baru
      const { data: newTopic, error: errorInserting } = await supabase
        .from('flashcard_topics')
        .insert([{ 
          name: topic.name, 
          category_id: categoryId,
          slug: slug
        }])
        .select();
      
      if (errorInserting) {
        throw new Error(`Error saat menambahkan topik ${topic.name}: ${errorInserting.message}`);
      }
      
      console.log(`Topik ${topic.name} ditambahkan dengan id ${newTopic[0].id}`);
      topicMap[topic.name] = newTopic[0].id;
    }
  }
  
  return topicMap;
};

// Fungsi untuk migrasi data flashcard
const migrateFlashcardData = async (topicMap) => {
  console.log('Migrasi data flashcard...');
  
  for (const flashcard of flashcards) {
    const topicId = topicMap[flashcard.topic_name];
    
    if (!topicId) {
      console.warn(`Topik ${flashcard.topic_name} tidak ditemukan untuk flashcard ${flashcard.question}`);
      continue;
    }
    
    // Periksa apakah flashcard sudah ada berdasarkan pertanyaan
    const { data: existingFlashcard, error: errorChecking } = await supabase
      .from('flashcards')
      .select('id, question')
      .eq('question', flashcard.question)
      .single();
    
    if (errorChecking && errorChecking.code !== 'PGRST116') {
      throw new Error(`Error saat memeriksa flashcard ${flashcard.question}: ${errorChecking.message}`);
    }
    
    if (existingFlashcard) {
      console.log(`Flashcard "${flashcard.question.substring(0, 30)}..." sudah ada dengan id ${existingFlashcard.id}`);
    } else {
      // Tambahkan flashcard baru
      const { data: newFlashcard, error: errorInserting } = await supabase
        .from('flashcards')
        .insert([{ 
          question: flashcard.question,
          answer: flashcard.answer,
          topic_id: topicId,
          difficulty: flashcard.difficulty
        }])
        .select();
      
      if (errorInserting) {
        throw new Error(`Error saat menambahkan flashcard ${flashcard.question}: ${errorInserting.message}`);
      }
      
      console.log(`Flashcard "${flashcard.question.substring(0, 30)}..." ditambahkan dengan id ${newFlashcard[0].id}`);
    }
  }
};

// Eksekusi migrasi
// migrateFlashcardsToSupabase(); 