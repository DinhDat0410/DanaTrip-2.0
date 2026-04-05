import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/image';
import '../../styles/card.css';
import { getImageUrl } from '../../utils/image';

const Card = ({ image, title, description, link, price }) => {
  return (
    <div className="card">
      <div className="card-image">
        <img src={getImageUrl(image)} alt={title} />
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