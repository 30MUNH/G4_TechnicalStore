import React, { useState } from 'react';

export const CheckoutForm = ({ total, onSubmit, onCancel, isLoading }) => {
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


    const addressData = {
        "Hà Nội": {
            "Quận Ba Đình": ["Phường Phúc Xá", "Phường Trúc Bạch", "Phường Vĩnh Phúc", "Phường Cống Vị", "Phường Liễu Giai", "Phường Nguyễn Trung Trực", "Phường Quán Thánh", "Phường Ngọc Hà", "Phường Điện Biên", "Phường Đội Cấn", "Phường Ngọc Khánh", "Phường Kim Mã", "Phường Giảng Võ", "Phường Thành Công"],
            "Quận Hoàn Kiếm": ["Phường Phúc Tấn", "Phường Đồng Xuân", "Phường Hàng Mã", "Phường Hàng Buồm", "Phường Hàng Đào", "Phường Hàng Bồ", "Phường Cửa Đông", "Phường Lý Thái Tổ", "Phường Hàng Bạc", "Phường Hàng Gai", "Phường Chương Dương Độ", "Phường Cửa Nam", "Phường Hàng Trống", "Phường Tràng Tiền", "Phường Trần Hưng Đạo", "Phường Phan Chu Trinh"],
            "Quận Hai Bà Trưng": ["Phường Nguyễn Du", "Phường Bạch Đằng", "Phường Phạm Đình Hổ", "Phường Lê Đại Hành", "Phường Đống Mác", "Phường Bách Khoa", "Phường Đồng Nhân", "Phường Phố Huế", "Phường Đồng Tâm", "Phường Quỳnh Lôi", "Phường Quỳnh Mai", "Phường Thanh Lương", "Phường Thanh Nhàn", "Phường Cầu Dền", "Phường Bùi Thị Xuân", "Phường Ngô Thì Nhậm", "Phường Trương Định", "Phường Minh Khai", "Phường Vĩnh Tuy"],
            "Quận Đống Đa": ["Phường Cát Linh", "Phường Văn Miếu", "Phường Quốc Tử Giám", "Phường Láng Thượng", "Phường Ô Chợ Dừa", "Phường Văn Chương", "Phường Hàng Bottom", "Phường Láng Hạ", "Phường Khâm Thiên", "Phường Thổ Quan", "Phường Nam Đồng", "Phường Trung Phụng", "Phường Quang Trung", "Phường Trung Liệt", "Phường Phương Liên", "Phường Thịnh Quang", "Phường Trung Tự", "Phường Kim Liên", "Phường Phương Mai", "Phường Ngã Tư Sở", "Phường Khương Thượng"],
            "Quận Tây Hồ": ["Phường Phú Thượng", "Phường Nhật Tân", "Phường Tứ Liên", "Phường Quảng An", "Phường Xuân La", "Phường Yên Phụ", "Phường Bưởi", "Phường Thụy Khuê"]
        },
        "TP. Hồ Chí Minh": {
            "Quận 1": ["Phường Tân Định", "Phường Đa Kao", "Phường Bến Nghé", "Phường Bến Thành", "Phường Nguyễn Thái Bình", "Phường Phạm Ngũ Lão", "Phường Cầu Ông Lãnh", "Phường Cô Giang", "Phường Nguyễn Cư Trinh", "Phường Cầu Kho"],
            "Quận 3": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
            "Quận 4": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 6", "Phường 8", "Phường 9", "Phường 10", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 18"],
            "Quận 5": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
            "Quận 6": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
            "Quận 7": ["Phường Tân Thuận Đông", "Phường Tân Thuận Tây", "Phường Tân Kiểng", "Phường Tân Hưng", "Phường Bình Thuận", "Phường Tân Quy", "Phường Phú Thuận", "Phường Tân Phú", "Phường Tân Phong", "Phường Phú Mỹ"],
            "Quận 8": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"],
            "Quận 10": ["Phường 1", "Phường 2", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
            "Quận 11": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"],
            "Quận 12": ["Phường Thạnh Xuân", "Phường Thạnh Lộc", "Phường Hiệp Thành", "Phường Thới An", "Phường Tân Chánh Hiệp", "Phường An Phú Đông", "Phường Tân Thới Hiệp", "Phường Trung Mỹ Tây", "Phường Tân Hưng Thuận", "Phường Đông Hưng Thuận", "Phường Tân Thới Nhất"]
        },
        "Đà Nẵng": {
            "Quận Hải Châu": ["Phường Thạch Thang", "Phường Hải Châu I", "Phường Hải Châu II", "Phường Phước Ninh", "Phường Hòa Thuận Tây", "Phường Hòa Thuận Đông", "Phường Nam Dương", "Phường Bình Hiên", "Phường Bình Thuận", "Phường Hòa Cường Bắc", "Phường Hòa Cường Nam", "Phường Thanh Bình"],
            "Quận Thanh Khê": ["Phường Tam Thuận", "Phường Thanh Khê Tây", "Phường Thanh Khê Đông", "Phường Xuân Hà", "Phường Tân Chính", "Phường Chính Gián", "Phường Vĩnh Trung", "Phường Thạc Gián", "Phường An Khê", "Phường Hòa Khê"],
            "Quận Sơn Trà": ["Phường Thọ Quang", "Phường Nại Hiên Đông", "Phường Mân Thái", "Phường An Hải Bắc", "Phường Phước Mỹ", "Phường An Hải Tây", "Phường An Hải Đông"],
            "Quận Ngũ Hành Sơn": ["Phường Mỹ An", "Phường Khuê Mỹ", "Phường Hoà Quý", "Phường Hoà Hải"],
            "Quận Liên Chiểu": ["Phường Hòa Hiệp Bắc", "Phường Hòa Hiệp Nam", "Phường Hòa Khánh Bắc", "Phường Hòa Khánh Nam", "Phường Hòa Minh"],
            "Quận Cẩm Lệ": ["Phường Khuê Trung", "Phường Hòa Phát", "Phường Hòa An", "Phường Hòa Thọ Tây", "Phường Hòa Thọ Đông"]
        },
        "Hải Phòng": {
            "Quận Hồng Bàng": ["Phường Quán Toan", "Phường Hùng Vương", "Phường Sở Dầu", "Phường Thượng Lý", "Phường Hạ Lý", "Phường Minh Khai", "Phường Trại Cau", "Phường Hoàng Văn Thụ", "Phường Phan Bội Châu"],
            "Quận Lê Chân": ["Phường Cát Dài", "Phường An Biên", "Phường Lam Sơn", "Phường An Dương", "Phường Trần Nguyên Hãn", "Phường Niệm Nghĩa", "Phường Nghĩa Xá", "Phường Dư Hàng", "Phường Cát Bi", "Phường Tràng Cát", "Phường Đông Hải", "Phường Niệm Nghĩa", "Phường Kênh Dương", "Phường Vĩnh Niệm"],
            "Quận Ngô Quyền": ["Phường Máy Chai", "Phường Máy Tơ", "Phường Vạn Mỹ", "Phường Cầu Tre", "Phường Lạc Viên", "Phường Cầu Đất", "Phường Gia Viên", "Phường Đông Khê", "Phường Lê Lợi"],
            "Quận Kiến An": ["Phường Quán Trữ", "Phường Lỗ Pond", "Phường Đồng Hòa", "Phường Bắc Sơn", "Phường Nam Sơn", "Phường Ngọc Sơn", "Phường Trần Thành Ngọ", "Phường Văn Đẩu", "Phường Đặng Cương", "Phường Lãm Hà", "Phường Đông Hải 2"]
        },
        "Cần Thơ": {
            "Quận Ninh Kiều": ["Phường Cái Khế", "Phường An Hòa", "Phường Thới Bình", "Phường An Nghiệp", "Phường An Cư", "Phường Tân An", "Phường An Phú", "Phường Xuân Khánh", "Phường Hưng Lợi", "Phường An Khánh", "Phường An Bình"],
            "Quận Bình Thủy": ["Phường Bình Thủy", "Phường Trà An", "Phường Trà Nóc", "Phường Thới An Đông", "Phường An Thới", "Phường Bùi Hữu Nghĩa", "Phường Long Hòa"],
            "Quận Cái Răng": ["Phường Lê Bình", "Phường Hưng Phú", "Phường Hưng Thạnh", "Phường Ba Láng", "Phường Thường Thạnh", "Phường Phú Thứ", "Phường Tân Phú"],
            "Quận Ô Môn": ["Phường Châu Văn Liêm", "Phường Ô Môn", "Phường Thới Hòa", "Phường Thới Long", "Phường Long Hưng", "Phường Phước Thới", "Phường Trường Lạc"],
            "Quận Thốt Nốt": ["Phường Thốt Nốt", "Phường Thới Thuận", "Phường Thuận An", "Phường Tân Lộc", "Phường Trung Nhứt", "Phường Thạnh Hoà", "Phường Trung Kiên", "Phường Collège Nghĩa Thành"]
        }
    };

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

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label htmlFor="city" className="form-label">Tỉnh/Thành phố *</label>
                        <select
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={`form-select ${errors.city ? 'is-invalid' : ''}`}
                        >
                            <option value="">Chọn tỉnh/thành phố</option>
                            {Object.keys(addressData).map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                        <label htmlFor="district" className="form-label">Quận/Huyện *</label>
                        <select
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className={`form-select ${errors.district ? 'is-invalid' : ''}`}
                            disabled={!formData.city}
                        >
                            <option value="">Chọn quận/huyện</option>
                            {formData.city && addressData[formData.city] &&
                                Object.keys(addressData[formData.city]).map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))
                            }
                        </select>
                        {errors.district && <div className="invalid-feedback">{errors.district}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                        <label htmlFor="ward" className="form-label">Phường/Xã *</label>
                        <select
                            id="ward"
                            name="ward"
                            value={formData.ward}
                            onChange={handleChange}
                            className={`form-select ${errors.ward ? 'is-invalid' : ''}`}
                            disabled={!formData.district}
                        >
                            <option value="">Chọn phường/xã</option>
                            {formData.city && formData.district &&
                                addressData[formData.city] &&
                                addressData[formData.city][formData.district] &&
                                addressData[formData.city][formData.district].map(ward => (
                                    <option key={ward} value={ward}>{ward}</option>
                                ))
                            }
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