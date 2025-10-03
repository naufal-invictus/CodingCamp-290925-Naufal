// Menunggu hingga seluruh konten HTML dimuat (DOM Ready) sebelum menjalankan script.
// Ini praktik terbaik untuk memastikan semua elemen HTML sudah ada saat script mencoba mengaksesnya.
document.addEventListener('DOMContentLoaded', () => {

    // --- SELEKSI ELEMEN DOM ---
    // Menyimpan elemen-elemen HTML ke dalam variabel agar lebih mudah diakses.
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');
    const todoList = document.getElementById('todo-list');
    const filterTodos = document.getElementById('filter-todos');

    // --- STATE APLIKASI (SUMBER DATA UTAMA) ---
    // Mencoba mengambil data 'todos' dari localStorage.
    // Jika tidak ada data (misalnya saat pertama kali membuka aplikasi),
    // maka kita akan menggunakan array kosong `[]` sebagai nilai awal.
    // `JSON.parse()` mengubah data string dari localStorage kembali menjadi array JavaScript.
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    // --- EVENT LISTENERS (PENDENGAR AKSI PENGGUNA) ---
    // Saat form disubmit (tombol '+' ditekan atau Enter di input), jalankan fungsi `addTodo`.
    todoForm.addEventListener('submit', addTodo);
    // Saat ada klik di mana saja di dalam area daftar <ul>, jalankan fungsi `handleTodoActions`.
    todoList.addEventListener('click', handleTodoActions);
    // Saat nilai pada dropdown filter berubah, jalankan fungsi `renderTodos`.
    filterTodos.addEventListener('change', renderTodos);

    // --- FUNGSI-FUNGSI ---

    // Fungsi untuk menyimpan array `todos` saat ini ke localStorage.
    function saveTodos() {
        // `JSON.stringify()` mengubah array JavaScript menjadi format string JSON
        // agar bisa disimpan di localStorage.
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // Fungsi untuk menambah todo baru.
    function addTodo(e) {
        // `e.preventDefault()` mencegah form mengirim data ke server dan me-refresh halaman.
        // Ini adalah perilaku default form HTML.
        e.preventDefault();

        // --- VALIDASI FORM ---
        // `trim()` menghapus spasi kosong di awal dan akhir string.
        // Cek apakah input nama task atau tanggal masih kosong.
        if (todoInput.value.trim() === '' || todoDate.value === '') {
            // Jika salah satunya kosong, tampilkan pesan peringatan.
            alert('Nama task dan tanggal tidak boleh kosong!');
            // `return` menghentikan eksekusi fungsi agar todo kosong tidak ditambahkan.
            return; 
        }

        // Membuat sebuah objek untuk todo yang baru.
        const newTodo = {
            id: Date.now(), // ID unik menggunakan timestamp, untuk membedakan setiap todo.
            text: todoInput.value,
            date: todoDate.value,
            completed: false // Status awal sebuah todo baru selalu 'belum selesai'.
        };

        // Menambahkan todo baru ke awal array `todos` menggunakan `unshift`.
        todos.unshift(newTodo);
        
        // Simpan array yang sudah diperbarui ke localStorage.
        saveTodos();
        
        // Tampilkan ulang seluruh daftar todo di layar.
        renderTodos();
        
        // Kosongkan kembali input form agar siap untuk input berikutnya.
        todoForm.reset();
    }

    // Fungsi untuk menangani aksi delete dan complete pada sebuah todo item.
    function handleTodoActions(e) {
        const target = e.target; // Elemen spesifik yang di-klik (bisa jadi ikon <i> atau tombol <button>).
        const todoItem = target.closest('.todo-item'); // Cari elemen parent terdekat dengan class '.todo-item'.

        if (!todoItem) return; // Jika yang diklik bukan bagian dari todo item, hentikan fungsi.

        // Ambil ID dari atribut 'data-id' yang kita simpan di elemen <li>.
        const todoId = Number(todoItem.dataset.id);
        
        // Jika elemen yang diklik memiliki class 'delete-btn' (atau di dalamnya).
        if (target.closest('.delete-btn')) {
            // `filter` membuat array baru yang isinya adalah semua todo
            // KECUALI todo yang ID-nya sama dengan `todoId` yang akan dihapus.
            todos = todos.filter(todo => todo.id !== todoId);
        }

        // Jika elemen yang diklik memiliki class 'complete-btn' (atau di dalamnya).
        if (target.closest('.complete-btn')) {
            // `find` mencari todo di dalam array yang ID-nya cocok.
            const todoToComplete = todos.find(todo => todo.id === todoId);
            // Ubah status `completed`-nya. Jika sebelumnya `false`, jadi `true`, begitu sebaliknya.
            todoToComplete.completed = !todoToComplete.completed;
        }

        // Setelah menghapus atau mengubah status, simpan perubahan dan render ulang.
        saveTodos();
        renderTodos();
    }

    // Fungsi untuk menampilkan semua todo ke layar HTML.
    function renderTodos() {
        todoList.innerHTML = ''; // Kosongkan daftar <ul> terlebih dahulu.
        
        const filterValue = filterTodos.value; // Ambil nilai filter saat ini ('all', 'completed', 'uncompleted').
        let filteredTodos = todos;

        // Logika untuk memfilter array `todos` berdasarkan pilihan.
        if (filterValue === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed === true);
        } else if (filterValue === 'uncompleted') {
            filteredTodos = todos.filter(todo => todo.completed === false);
        }

        // Loop melalui array `filteredTodos` (yang sudah difilter atau masih utuh).
        filteredTodos.forEach(todo => {
            const li = document.createElement('li'); // Buat elemen <li>.
            li.classList.add('todo-item');
            li.dataset.id = todo.id; // Simpan ID di `data-id` untuk referensi nanti.

            if (todo.completed) {
                li.classList.add('completed'); // Tambah class 'completed' untuk styling CSS (coretan).
            }

            // Atur konten HTML untuk elemen <li>.
            li.innerHTML = `
                <div class="todo-content">
                    <span class="todo-text">${todo.text}</span>
                    <span class="todo-date">${todo.date}</span>
                </div>
                <div class="todo-actions">
                    <button class="complete-btn"><i class="fas fa-check"></i></button>
                    <button class="delete-btn"><i class="fas fa-minus"></i></button>
                </div>
            `;
            
            // Tambahkan <li> yang sudah jadi ke dalam <ul>.
            todoList.appendChild(li);
        });
    }

    // Panggil fungsi ini sekali saat halaman pertama kali dimuat
    // untuk menampilkan data yang mungkin sudah ada di localStorage.
    renderTodos();
});