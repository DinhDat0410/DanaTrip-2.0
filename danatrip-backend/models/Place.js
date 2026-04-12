const mongoose = require('mongoose');

// Sub-schema: DiaDiem_HinhAnh
const PlaceImageSchema = new mongoose.Schema({
  urlAnh: { type: String, required: true },
});

// Sub-schema: DiaDiem_DiemThamQuan
const VisitPointSchema = new mongoose.Schema({
  tenDiem: { type: String, required: true },
  moTa: { type: String, default: '' },
  hinhAnh: { type: String, default: '' },
});

// Sub-schema: DiaDiem_ThongTin
const PlaceInfoSchema = new mongoose.Schema({
  tieuDe: { type: String, required: true },
  noiDung: { type: String, default: '' },
});

// Sub-schema: DiaDiem360
const View360Schema = new mongoose.Schema({
  tieuDe: { type: String, default: '' },
  link360: { type: String, required: true },
  thumbnail: { type: String, default: '' },
});

// Main schema: DiaDiem
const PlaceSchema = new mongoose.Schema(
  {
    maDiaDiem: {
      type: String,
      default: '',
    },
    tenDiaDiem: {
      type: String,
      required: [true, 'Vui lòng nhập tên địa điểm'],
      trim: true,
    },
    noiDung: {
      type: String,
      default: '',
    },
    hinhAnhChinh: {
      type: String,
      default: '',
    },
    viTri: {
      type: String,
      default: '',
    },
    trangThai: {
      type: String,
      enum: ['Hoạt động', 'Tạm ngưng'],
      default: 'Hoạt động',
    },
    hienThi: {
      type: Boolean,
      default: true,
    },

    // Nhúng các bảng con (thay vì JOIN)
    hinhAnh: [PlaceImageSchema],         // DiaDiem_HinhAnh
    diemThamQuan: [VisitPointSchema],    // DiaDiem_DiemThamQuan
    thongTin: [PlaceInfoSchema],         // DiaDiem_ThongTin
    view360: [View360Schema],            // DiaDiem360
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Lấy danh sách tour thuộc địa điểm này
PlaceSchema.virtual('tours', {
  ref: 'Tour',
  localField: '_id',
  foreignField: 'diaDiem',
  justOne: false,
});

module.exports = mongoose.model('Place', PlaceSchema);