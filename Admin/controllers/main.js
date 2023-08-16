getProducts();

function getProducts() {
   apiGetProducts()
      .then((response) => {
         // Gọi hàm display để hiển thị ra giao diện
         display(response.data);
      })
      .catch((error) => {
         console.log(error);
      });
}

function createProduct() {
   // DOM và khởi tạo object product
   const product = validation();

   if (!product) return;

   // Gọi API thêm sản phẩm
   apiCreateProduct(product)
      .then((response) => {
         // Sau khi thêm thành công, dữ liệu chỉ mới được cập nhật ở phía server. Ta cần gọi lại hàm apiGetProducts để lấy được danh sách những sản phẩm mới nhất (bao gồm sản phẩm mình mới thêm)
         return apiGetProducts();
      })
      .then((response) => {
         // response là kết quả promise của hàm apiGetProducts
         display(response.data);

         // Ẩn modal
         $("#myModal").modal("hide");
      })
      .catch((error) => {
         console.log(error);
      });
}

function resetForm() {
   getElement("#TenSP").value = "";
   getElement("#GiaSP").value = "";
   getElement("#manHinh").value = "";
   getElement("#cameraSau").value = "";
   getElement("#cameraTruoc").value = "";
   getElement("#HinhSP").value = "";
   getElement("#moTa").value = "";
   getElement("#loaiSP").value = "";

   getElement("#spanTenSP").innerHTML = "";
   getElement("#spanGiaSP").innerHTML = "";
   getElement("#spanmanHinh").innerHTML = "";
   getElement("#spancameraSau").innerHTML = "";
   getElement("#spancameraTruoc").innerHTML = "";
   getElement("#spanHinhSP").innerHTML = "";
   getElement("#spanmoTa").innerHTML = "";
   getElement("#spanloaiSP").innerHTML = "";
}

function deleteProduct(productId) {
   apiDeleteProduct(productId)
      .then(() => {
         // Xoá thành công
         return apiGetProducts();
      })
      .then((response) => {
         display(response.data);
      })
      .catch((error) => {
         console.log(error);
      });
}

function selectProduct(productId) {
   resetForm();

   // Hiển thị modal
   $("#myModal").modal("show");
   // Hiển thị title và footer của modal
   getElement(".modal-title").innerHTML = "Cập nhật sản phẩm";
   getElement(".modal-footer").innerHTML = `
    <button class="btn btn-secondary" data-dismiss="modal">Huỷ</button>
    <button class="btn btn-success" onclick="updateProduct('${productId}')">Cập nhật</button>
  `;

   apiGetProductById(productId)
      .then((response) => {
         // Lấy thông tin sản phẩm thành công => hiển thị dữ liệu lên form
         let product = response.data;
         getElement("#TenSP").value = product.name;
         getElement("#GiaSP").value = product.price;
         getElement("#manHinh").value = product.screen;
         getElement("#cameraSau").value = product.backCamera;
         getElement("#cameraTruoc").value = product.frontCamera;
         getElement("#HinhSP").value = product.img;
         getElement("#moTa").value = product.desc;
         getElement("#loaiSP").value = product.type;
      })
      .catch((error) => {
         console.log(error);
      });
}

function updateProduct(productId) {
   // DOM và khởi tạo object product
   let newProduct = validation();
   if (!newProduct) return;

   apiUpdateProduct(productId, newProduct)
      .then(() => {
         // Cập nhật thành công
         return apiGetProducts();
      })
      .then((response) => {
         display(response.data);
         $("#myModal").modal("hide");
      })
      .catch((error) => {
         console.log(error);
      });
}

function display(products) {
   let html = products.reduce((result, value, index) => {
      let product = new Product(
         value.id,
         value.name,
         value.price,
         value.screen,
         value.backCamera,
         value.frontCamera,
         value.img,
         value.desc,
         value.type
      );

      return (
         result +
         `
        <tr>
          <td>${index + 1}</td>
          <td>${product.name}</td>
          <td>${product.price}</td>
          <td>
            <img src="${product.img}" width="100px" height="100px" />
          </td>
          <td>${product.desc}</td>
          <td>
            <button
              class="btn btn-primary"
              onclick="selectProduct('${product.id}')"
            >
              Chỉnh
            </button>
            <button
              class="btn btn-danger"
              onclick="deleteProduct('${product.id}')"
            >
              Xoá
            </button>
          </td>
        </tr>
      `
      );
   }, "");

   document.getElementById("tblDanhSachSP").innerHTML = html;
}

// VALIDATE
function isPrice(value) {
   if (isNaN(value)) {
      return false;
   }
   return true;
}

function isRequired(value) {
   if (!value.trim()) {
      return false;
   }
   return true;
}

function validation() {
   let product = {
      name: getElement("#TenSP").value,
      price: getElement("#GiaSP").value,
      screen: getElement("#manHinh").value,
      frontCamera: getElement("#cameraTruoc").value,
      backCamera: getElement("#cameraSau").value,
      img: getElement("#HinhSP").value,
      desc: getElement("#moTa").value,
      type: getElement("#loaiSP").value,
   };

   let isValid = true;
   for (const key in product) {
      if (!isRequired(product[key])) {
         isValid = false;
         errorMsg(
            `#span${PRODUCT_ID[key]}`,
            `${PRODUCTID_DESC[key]} sản phẩm không được để trống!`
         );
      } else {
         errorMsg(`#span${PRODUCT_ID[key]}`, "");
      }

      if (product[key] && PRODUCT_ID[key] === "GiaSP") {
         if (!isPrice(product[key])) {
            isValid = false;
            errorMsg(
               `#span${PRODUCT_ID[key]}`,
               `${PRODUCTID_DESC[key]} sản phẩm phải là số!`
            );
         }
      }
   }

   if (!isValid) {
      return;
   }

   return { ...product, price: product.price * 1 };
}

// ======= DOM =======
getElement("#btnThemSP").onclick = () => {
   getElement(".modal-title").innerHTML = "Thêm sản phẩm";
   getElement(".modal-footer").innerHTML = `
    <button class="btn btn-secondary" data-dismiss="modal">Huỷ</button>
    <button class="btn btn-success" onclick="createProduct()">Thêm</button>
  `;

   resetForm();
};

// ======= Utils =======
function getElement(selector) {
   return document.querySelector(selector);
}

function errorMsg(id, msg) {
   getElement(id).innerHTML = msg;
}

// CONST
const PRODUCT_ID = {
   name: "TenSP",
   price: "GiaSP",
   img: "HinhSP",
   type: "loaiSP",
   screen: "manHinh",
   backCamera: "cameraSau",
   frontCamera: "cameraTruoc",
   desc: "moTa",
};

const PRODUCTID_DESC = {
   name: "Tên",
   price: "Giá",
   img: "Ảnh",
   type: "Loại",
   screen: "Màn hình",
   backCamera: "Camera sau",
   frontCamera: "Camera trước",
   desc: "Miêu tả",
};
