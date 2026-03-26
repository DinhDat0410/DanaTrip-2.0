import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFoods = async () => {
    try {
      const res = await API.get('/foods');
      setFoods(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoods(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xác nhận xóa món "${name}"?`)) return;
    try {
      await API.delete(`/foods/${id}`);
      toast.success('Đã xóa món ăn');
      fetchFoods();
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>🍜 Quản lý Ẩm thực</h1>
        <Link to="/admin/foods/new" className="btn-add">
          <FaPlus /> Thêm món ăn
        </Link>
      </div>

      <table className="admin-table full">
        <thead>
          <tr>
            <th>#</th>
            <th>Hình</th>
            <th>Tên món</th>
            <th>Mô tả</th>
            <th>Hiển thị</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food, i) => (
            <tr key={food._id}>
              <td>{i + 1}</td>
              <td><img src={food.hinhAnh || '/images/placeholder.jpg'} alt="" className="table-img" /></td>
              <td><strong>{food.tenMon}</strong></td>
              <td>{food.moTa?.substring(0, 50)}...</td>
              <td>
                <span className={`badge ${food.hienThi ? 'done' : 'pending'}`}>
                  {food.hienThi ? 'Hiện' : 'Ẩn'}
                </span>
              </td>
              <td>
                <div className="action-btns">
                  <Link to={`/admin/foods/edit/${food._id}`} className="btn-edit"><FaEdit /></Link>
                  <button onClick={() => handleDelete(food._id, food.tenMon)} className="btn-delete"><FaTrash /></button>
                </div>
              </td>
            </tr>
          ))}
          {foods.length === 0 && <tr><td colSpan={6} className="empty">Chưa có món ăn nào</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default AdminFoods;