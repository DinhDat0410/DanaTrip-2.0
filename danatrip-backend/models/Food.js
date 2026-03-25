const mongoose = require('mongoose');

const FoodImageSchema = new mongoose.Schema({
  urlAnh: { type: String, required: true },
});

const IngredientSchema = new mongoose.Schema({
  tenNguyenLieu: { type: String, required: true },
});

const CookingStepSchema = new mongoose.Schema({
  thuTu: { type: Number, required: true },
  moTaBuoc: { type: String, required: true },
  thoiGian: { type: String, default: '' },
});

const RestaurantSchema = new mongoose.Schema({
  tenQuanAn: { type: String, required: true },
  diaChi: { type: String, default: '' },
  sdt: { type: String, default: '' },
});

const FoodSchema = new mongoose.Schema(
  {
    tenMon: {
      type: String,
      required: [true, 'Vui lòng nhập tên món'],
      trim: true,
    },
    moTa: { type: String, default: '' },
    hinhAnh: { type: String, default: '' },
    hienThi: { type: Boolean, default: true },

    albumAnh: [FoodImageSchema],
    nguyenLieu: [IngredientSchema],
    quyTrinh: [CookingStepSchema],
    quanAn: [RestaurantSchema],
  },
  { timestamps: true }
);

FoodSchema.index({ tenMon: 'text', moTa: 'text' });

module.exports = mongoose.model('Food', FoodSchema);