import React, { useState } from 'react';
import { useVietnamProvinces } from '../../Hook/useVietnamProvinces';
import { getDistrictsByProvince, getWardsByDistrict } from '../../services/vietnamProvinces';

export const CheckoutForm = ({ total, onSubmit, onCancel, isLoading }) => {
    // Sử dụng dữ liệu địa giới hành chính từ GitHub
    const { provinces, loading: provincesLoading, error: provincesError } = useVietnamProvinces();
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        notes: '',
        paymentMethod: 'cash'
    });

    const [errors, setErrors] = useState({});

    // Lấy danh sách quận/huyện và phường/xã dựa trên lựa chọn hiện tại
    const availableDistricts = formData.city ? getDistrictsByProvince(provinces, formData.city) : [];
    const availableWards = (formData.city && formData.district) ? 
        getWardsByDistrict(provinces, formData.city, formData.district) : [];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
        if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
        if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
        else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Số điện thoại không hợp lệ';
        if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
        if (!formData.city.trim()) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
        if (!formData.district.trim()) newErrors.district = 'Vui lòng chọn quận/huyện';
        if (!formData.ward.trim()) newErrors.ward = 'Vui lòng chọn phường/xã';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;


        if (name === 'city') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                district: '',
                ward: ''
            }));
        }

        else if (name === 'district') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                ward: ''
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }


        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit}>

            <div className="mb-4">
                <h6 className="fw-bold mb-3">👤 Thông tin liên hệ</h6>

                <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">Họ và tên *</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                        placeholder="Nguyễn Văn A"
                    />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="example@email.com"
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="phone" className="form-label">Số điện thoại *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                            placeholder="0123456789"
                        />
                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>
                </div>
            </div>


            <div className="mb-4">
                <h6 className="fw-bold mb-3">📍 Địa chỉ giao hàng</h6>

                <div className="mb-3">
                    <label htmlFor="address" className="form-label">Địa chỉ cụ thể *</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                        placeholder="Số nhà, tên đường"
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                </div>

                {/* Hiển thị loading state hoặc error nếu có */}
                {provincesLoading && (
                    <div className="alert alert-info d-flex align-items-center mb-3">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Đang tải dữ liệu địa giới hành chính...
                    </div>
                )}
                
                {provincesError && (
                    <div className="alert alert-warning mb-3">
                        <strong>⚠️ Lưu ý:</strong> {provincesError}. Đang sử dụng dữ liệu cơ bản.
                    </div>
                )}

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label htmlFor="city" className="form-label">
                            Tỉnh/Thành phố * 
                            <small className="text-muted">({Object.keys(provinces).length} tỉnh/thành)</small>
                        </label>
                        <select
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={`form-select ${errors.city ? 'is-invalid' : ''}`}
                            disabled={provincesLoading}
                        >
                            <option value="">
                                {provincesLoading ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                            </option>
                            {Object.keys(provinces).map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                    </div>
                    
                    <div className="col-md-4 mb-3">
                        <label htmlFor="district" className="form-label">
                            Quận/Huyện *
                            {formData.city && (
                                <small className="text-muted"> ({availableDistricts.length} quận/huyện)</small>
                            )}
                        </label>
                        <select
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className={`form-select ${errors.district ? 'is-invalid' : ''}`}
                            disabled={!formData.city || provincesLoading}
                        >
                            <option value="">
                                {!formData.city ? 'Chọn tỉnh/thành phố trước' : 'Chọn quận/huyện'}
                            </option>
                            {availableDistricts.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                        {errors.district && <div className="invalid-feedback">{errors.district}</div>}
                    </div>
                    
                    <div className="col-md-4 mb-3">
                        <label htmlFor="ward" className="form-label">
                            Phường/Xã *
                            {formData.district && (
                                <small className="text-muted"> ({availableWards.length} phường/xã)</small>
                            )}
                        </label>
                        <select
                            id="ward"
                            name="ward"
                            value={formData.ward}
                            onChange={handleChange}
                            className={`form-select ${errors.ward ? 'is-invalid' : ''}`}
                            disabled={!formData.district || provincesLoading}
                        >
                            <option value="">
                                {!formData.district ? 'Chọn quận/huyện trước' : 'Chọn phường/xã'}
                            </option>
                            {availableWards.map(ward => (
                                <option key={ward} value={ward}>{ward}</option>
                            ))}
                        </select>
                        {errors.ward && <div className="invalid-feedback">{errors.ward}</div>}
                    </div>
                </div>
            </div>


            <div className="mb-4">
                <label htmlFor="notes" className="form-label">📝 Ghi chú đơn hàng</label>
                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ghi chú thêm về đơn hàng (tùy chọn)"
                    rows="3"
                />
            </div>


            <div className="mb-4">
                <h6 className="fw-bold mb-3">💳 Phương thức thanh toán</h6>

                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="cash"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cash">
                        <div>
                            <strong>Thanh toán khi nhận hàng (COD)</strong>
                            <br />
                            <small className="text-muted">Thanh toán bằng tiền mặt khi nhận hàng</small>
                        </div>
                    </label>
                </div>

                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="bank"
                        value="bank"
                        checked={formData.paymentMethod === 'bank'}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="bank">
                        <div>
                            <strong>Chuyển khoản ngân hàng</strong>
                            <br />
                            <small className="text-muted">Thanh toán qua chuyển khoản trước khi giao hàng</small>
                        </div>
                    </label>
                </div>
            </div>

            {/* Total và Action buttons */}
            <hr />
            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fs-5 fw-bold">Tổng thanh toán:</span>
                <span className="fs-4 fw-bold text-primary">{total.toLocaleString()}đ</span>
            </div>

            <div className="d-grid gap-2">
                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang xử lý...' : '🛒 Đặt hàng ngay'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-outline-secondary"
                    disabled={isLoading}
                >
                    ← Quay lại giỏ hàng
                </button>
            </div>
        </form>
    );
}; 