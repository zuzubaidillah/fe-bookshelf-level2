const ITEMS_MENU = [{
  label: "Buku", url: "index.html"
}, {
  label: "Pengguna", url: "pengguna.html"
}]
let API_BASE_URL = "http://localhost/smkti/restApi-bookshelf-level2";

$(document).ready(function () {
  handle_promp_apibaseurl()

  $("#btnComplete").click(function () {
  })

  $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
    if (jqxhr.status === 500) {
      // Tampilkan peringatan umum jika mendapatkan status code 500
      alert("Server error");
    } else if (jqxhr.status === 401) {
      handler_401();
    }
  });

  $("#btn_logout").click(function () {
    localStorage.clear()
    window.location = "login.html"
  })

  $(document).on("click", "#btnEdit", function () {
    let book_id = $(this).data("id");
    console.log("Edit button clicked for book with ID:", book_id);
    window.location = `book-edit.html?book_id=${book_id}`
  })

  $(document).on("click", "#btnComplete", function () {
    let book_id = $(this).data("id");
    console.log("btnComplete button clicked for book with ID:", book_id);
    book_membaca(book_id, true)
  })

  $(document).on("click", "#btnNotComplete", function () {
    let book_id = $(this).data("id");
    console.log("btnNotComplete button clicked for book with ID:", book_id);
    book_membaca(book_id, false)
  })

  $(document).on("click", "#btnDelete", function () {
    let book_id = $(this).data("id");
    book_hapus(book_id)
  })
});

const handle_promp_apibaseurl = () => {
  // Mendapatkan nilai base URL dari localStorage
  let storedBaseUrl = localStorage.getItem("API_BASE_URL");

  // Jika belum ada nilai tersimpan, minta pengguna memasukkan nilai
  if (!storedBaseUrl) {
    let baseUrl = prompt("Masukkan Base URL: contoh http://localhost/smkti/restApi-bookshelf-level2");

    // Jika pengguna memasukkan nilai, simpan di localStorage
    if (baseUrl) {
      // Hapus tanda '/' di akhir baseUrl jika sudah ada
      baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      localStorage.setItem("API_BASE_URL", baseUrl);
      API_BASE_URL = baseUrl
      alert("Base URL berhasil disimpan.");
    } else {
      alert("Anda perlu memasukkan Base URL untuk melanjutkan.");
      window.location = "";
    }
  } else {
    API_BASE_URL = localStorage.getItem("API_BASE_URL")
  }
}

const load_menu = () => {
  const menu = document.querySelector("#menu")

  menu.innerHTML = ""
  ITEMS_MENU.forEach((menuItem) => {
    // Create a new list item
    const listItem = document.createElement("li");
    listItem.classList.add("nav-item");

    // Create a new anchor element
    const anchor = document.createElement("a");
    anchor.classList.add("nav-link", "active");
    anchor.setAttribute("aria-current", "page");
    anchor.href = menuItem.url;
    anchor.textContent = menuItem.label;

    // Append the anchor element to the list item
    listItem.appendChild(anchor);

    // Append the list item to the menu
    menu.appendChild(listItem);
  });
}

const handler_401 = () => {
  alert("Anda harus login ulang.")
  localStorage.clear()
  window.location = "login.html"
}

const auth_current = () => {
  const auth_name = document.querySelector("#label_auth_name")
  auth_name.innerHTML = ""

  // Kirim permintaan POST menggunakan jQuery
  $.ajax({
    type: "GET", url: `${API_BASE_URL}/api/auth/current`, contentType: "application/json", headers: {
      Authorization: `Bearer ${localStorage.getItem("LS_APP")}`
    }, success: function (response) {
      // jika status header 200 ini yang akan dijalankan

      auth_name.innerHTML = `Pengguna: ${response.data.name}`
    }, error: function (error) {
      // jika status 500 tidak perlu di kasih notifikasi karena sudah ada di global
      if (error.status < 500 || error.status !== 401) {
        alert(error.responseJSON.message || "Gagal diproses.");
      }
    }
  });
}

const handel_book = (datases) => {
  if (!datases.length) {
    return `
    <div class="col-12 col-md-4 col-lg-3">
            <div class="card">
                <div class="card-body text-center">
                    <h5 class="card-title">Data Masih Kosong</h5>
                </div>
            </div>
        </div>`
  }
  return datases.map(item => {
    let btnIsComplete = `<a data-id="${item.id}" id="btnComplete" href="#" class="btn btn-success mb-2">Sudah Dibaca</a>`
    if (item.isComplete) {
      btnIsComplete = `<a data-id="${item.id}" id="btnNotComplete" href="#" class="btn btn-warning mb-2">Belum Dibaca</a>`
    }
    return `
    <div class="col-12 col-md-4 col-lg-3">
            <div class="card">
                <img src="${API_BASE_URL}/${item.file}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="...">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <small><span class="text-muted">By:</span> ${item.creator_name}</small>
                    <p class="card-text p-0 m-0"><span class="text-muted">Pengarang:</span> ${item.author}</p>
                    <p class="card-text"><span class="text-muted">Tahun:</span> ${item.year}</p>
                    ${btnIsComplete}
                    <a data-id="${item.id}" id="btnDelete" href="#" class="btn btn-danger mb-2">Hapus</a>
                    <a data-id="${item.id}" id="btnEdit" href="#" class="btn btn-info mb-2">Edit</a>
                </div>
            </div>
        </div>`
  }).join("");
}

const book_ambil_data = (jenis) => {
  let params = ""
  if (jenis) {
    params = `?status=${jenis}`
  }
  $.ajax({
    type: "GET",
    url: `${API_BASE_URL}/api/book${params}`,
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("LS_APP")}`
    },
    success: function (response) {

      const book = handel_book(response.data)
      $("#content_book").html(book)
    }, error: function (error) {
      // jika status 500 tidak perlu di kasih notifikasi karena sudah ada di global
      if (error.status < 500 || error.status !== 401) {
        alert(error.responseJSON.message || "Gagal diproses.");
      }
    }
  });
}

const book_detail = (book_id) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: `${API_BASE_URL}/api/book/${book_id}`,
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("LS_APP")}`
      },
      success: function (response) {
        resolve(response.data);
      },
      error: function (error) {
        // jika status 500 tidak perlu di kasih notifikasi karena sudah ada di global
        if (error.status < 500 || error.status !== 401) {
          alert(error.responseJSON.message || "Gagal diproses.");
        }
        reject(false);
      }
    });
  });
};

const book_membaca = (book_id, isComplete) => {
  const data = {
    isComplete: isComplete ? 1 : 0
  }

  $.ajax({
    type: "PUT",
    url: `${API_BASE_URL}/api/book/${book_id}/read-book`,
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("LS_APP")}`
    },
    data: JSON.stringify(data),
    success: function (response) {

      book_ambil_data(status)
    }, error: function (error) {
      // jika status 500 tidak perlu di kasih notifikasi karena sudah ada di global
      if (error.status < 500 || error.status !== 401) {
        alert(error.responseJSON.message || "Gagal diproses.");
      }
    }
  });
}

const book_hapus = (book_id) => {
  $.ajax({
    type: "DELETE",
    url: `${API_BASE_URL}/api/book/${book_id}`,
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("LS_APP")}`
    },
    success: function (response) {
      book_ambil_data(status)
    }, error: function (error) {
      // jika status 500 tidak perlu di kasih notifikasi karena sudah ada di global
      if (error.status < 500 || error.status !== 401) {
        alert(error.responseJSON.message || "Gagal diproses.");
      }
    }
  });
}
