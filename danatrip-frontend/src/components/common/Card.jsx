import { Link } from 'react-router-dom';
import '../../styles/card.css';

const Card = ({ image, title, description, link, price }) => {
  return (
    <div className="card">
      <div className="card-image">
        <img src={image || '/images/placeholder.jpg'} alt={title} />
      </div>
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">
          {description?.length > 100
            ? description.substring(0, 100) + '...'
            : description}
        </p>
        {price && (
          <p className="card-price">{price.toLocaleString('vi-VN')}đ</p>
        )}
        <Link to={link} className="card-link">
          Xem chi tiết →
        </Link>
      </div>
    </div>
  );
};

export default Card;