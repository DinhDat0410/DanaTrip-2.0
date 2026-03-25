const mongoose = require('mongoose');

const TourImageSchema = new mongoose.Schema({
  urlAnh: { type: String, required: true },
});

const TourHighlightSchema = new mongoose.Schema({
  noiDung: { type: String, required: true },
});

const TourScheduleSchema = new mongoose.Schema({
  thuTu: { type: Number, required: true },
  tieuDe: { type: String, default: '' },
  moTa: { type: String, default: '' },
});

const TourIncludeSchema = new mongoose.Schema({
  noiDung: { type: String, required: true },
  loai: {
    type: String,
    enum: ['included', 'excluded'],
    default: 'included',
  },
});

const TourSchema = new mongoose.Schema(
  {
    diaDiem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: [true, 'Tour phải thuộc một địa điểm'],
    },
    tenTour: {
      type: String,
      required: [true, 'Vui lòng nhập tên tour'],
      trim: true,
    },
    moTaNgan: { type: String, default: '' },
    moTaChiTiet: { type: String, default: '' },
    giaNguoiLon: { type: Number, required: true, min: 0 },
    giaTreEm: { type: Number, default: 0, min: 0 },
    ngayKhoiHanh: { type: Date },
    soCho: { type: Number, default: 0 },
    soChoDaDat: { type: Number, default: 0 },
    trangThai: {
      type: String,
      enum: ['Hoạt động', 'Tạm ngưng', 'Đã hủy'],
      default: 'Hoạt động',
    },
    hienThi: { type: Boolean, default: true },
    tags: [{ type: String }],          // TourTagMapping

    // Nhúng bảng con
    hinhAnh: [TourImageSchema],         // TourImages
    highlights: [TourHighlightSchema],  // TourHighlights
    lichTrinh: [TourScheduleSchema],    // TourSchedule
    baoGom: [TourIncludeSchema],        // TourIncludes
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Tính số chỗ còn lại
TourSchema.virtual('soChoConLai').get(function () {
  return this.soCho - this.soChoDaDat;
});

module.exports = mongoose.model('Tour', TourSchema);