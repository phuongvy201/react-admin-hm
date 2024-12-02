import { COLOR_OPTIONS } from "../constants/productConstants";
import PropTypes from "prop-types";

export const ColorBlock = ({
  uniqueId,
  handleColorImageChange,
  colorCropData,
  IMAGE_DIMENSIONS,
}) => {
  return (
    <div className="row" key={uniqueId}>
      <div className="form-group col-12 col-sm-5">
        <select className="form-control select-option-color">
          <option selected>Choose a color</option>
          {COLOR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} data-color={opt.color}>
              {opt.value}
            </option>
          ))}
        </select>
      </div>
      <div className="col-12 col-sm-7">
        <div className="row">
          <div className="col-sm-6 d-flex align-items-center">
            <input
              id={uniqueId}
              type="file"
              className="form-control border-0 d-none"
              accept="image/*"
              onChange={(e) => handleColorImageChange(e, uniqueId)}
            />
            <div className="input-group-append">
              <label
                htmlFor={uniqueId}
                className="btn btn-light m-0 rounded-pill px-4"
              >
                <i className="fa fa-cloud-upload mr-2 text-muted"></i>
                <small className="text-uppercase font-weight-bold text-muted">
                  Choose file
                </small>
              </label>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="image-area mt-2">
              <img
                id={`img_${uniqueId}`}
                src={
                  colorCropData[uniqueId] ||
                  "https://cdn-icons-png.flaticon.com/128/179/179378.png"
                }
                alt=""
                className="img-fluid rounded shadow-sm mx-auto d-block"
                style={{
                  width: IMAGE_DIMENSIONS.width,
                  height: IMAGE_DIMENSIONS.height,
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ColorBlock.propTypes = {
  uniqueId: PropTypes.string.isRequired,
  handleColorImageChange: PropTypes.func.isRequired,
  colorCropData: PropTypes.string,
  IMAGE_DIMENSIONS: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string,
  }).isRequired,
};
