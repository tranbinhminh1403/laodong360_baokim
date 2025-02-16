import { transporter } from '../config/emailTransporter';

export const sendPaymentSuccessEmail = async (orderData: any): Promise<boolean> => {
    try {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .header {
                        background: #4CAF50;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .content {
                        background: #f9f9f9;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 0 0 5px 5px;
                    }
                    .order-info {
                        background: white;
                        padding: 15px;
                        margin: 10px 0;
                        border-radius: 5px;
                        border: 1px solid #eee;
                    }
                    .info-group {
                        margin: 10px 0;
                        padding: 10px;
                    }
                    .info-label {
                        color: #666;
                        font-size: 0.9em;
                        margin-bottom: 5px;
                    }
                    .info-value {
                        color: #333;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Thanh toán thành công! 🎉</h1>
                    </div>
                    <div class="content">
                        <p>Chào ${orderData.fullName},</p>
                        <p>Đơn hàng của bạn đã được thanh toán thành công.</p>
                        
                        <div class="order-info">
                            <h3>Thông tin khách hàng:</h3>
                            <div class="info-group">
                                <div class="info-label">Họ tên:</div>
                                <div class="info-value">${orderData.fullName}</div>
                            </div>
                            <div class="info-group">
                                <div class="info-label">Email:</div>
                                <div class="info-value">${orderData.email}</div>
                            </div>
                            <div class="info-group">
                                <div class="info-label">Số điện thoại:</div>
                                <div class="info-value">${orderData.phoneNumber}</div>
                            </div>
                            <div class="info-group">
                                <div class="info-label">Tuổi:</div>
                                <div class="info-value">${orderData.age}</div>
                            </div>
                            <div class="info-group">
                                <div class="info-label">Giới tính:</div>
                                <div class="info-value">${orderData.gender}</div>
                            </div>
                        </div>

                        <div class="order-info">
                            <h3>Thông tin đơn hàng:</h3>
                            <div class="info-group">
                                <div class="info-label">Mã đơn hàng:</div>
                                <div class="info-value">${orderData.orderReference}</div>
                            </div>
                            <div class="info-group">
                                <div class="info-label">Gói dịch vụ:</div>
                                <div class="info-value">${orderData.title}</div>
                            </div>
                            <div class="info-group">
                                <div class="info-label">Thời gian tư vấn:</div>
                                <div class="info-value">${orderData.period} phút</div>
                            </div>
                            <div class="info-group">
                                <div class="info-label">Số tiền:</div>
                                <div class="info-value">${Number(orderData.price).toLocaleString('vi-VN')} VNĐ</div>
                            </div>
                            <div class="info-group">
                                <div class="info-label">Thời gian đặt:</div>
                                <div class="info-value">${new Date(orderData.time).toLocaleString('vi-VN')}</div>
                            </div>
                            <div class="info-group">
                                <div class="info-label">Ghi chú:</div>
                                <div class="info-value">${orderData.note}</div>
                            </div>
                        </div>

                        <div class="footer">
                            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                            <p>Mọi thắc mắc xin liên hệ: <strong>${process.env.SUPPORT_EMAIL || 'support@example.com'}</strong></p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: orderData.email,
            subject: `Thanh toán thành công đơn hàng ${orderData.orderReference}`,
            html
        });
        
        console.log(`[${new Date().toISOString()}] Payment success email sent: ${info.messageId}`);
        return true;
    } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Payment success email failed:`, error.message);
        return false;
    }
};

export const sendNewOrderNotification = async (orderData: any): Promise<boolean> => {
    try {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .header {
                        background: #4CAF50;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .content {
                        background: #f9f9f9;
                        padding: 20px;
                        border: 1px solid #ddd;
                    }
                    .order-info {
                        background: white;
                        padding: 15px;
                        margin: 10px 0;
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Đơn hàng mới được tạo! 🎉</h1>
                    </div>
                    <div class="content">
                        <div class="order-info">
                            <h3>Thông tin khách hàng:</h3>
                            <p>Họ tên: ${orderData.fullName}</p>
                            <p>Email: ${orderData.email}</p>
                            <p>Số điện thoại: ${orderData.phoneNumber}</p>
                            <p>Tuổi: ${orderData.age}</p>
                            <p>Giới tính: ${orderData.gender}</p>
                        </div>

                        <div class="order-info">
                            <h3>Thông tin đơn hàng:</h3>
                            <p>Mã đơn hàng: ${orderData.orderReference}</p>
                            <p>Gói dịch vụ: ${orderData.title}</p>
                            <p>Thời gian tư vấn: ${orderData.period} phút</p>
                            <p>Số tiền: ${Number(orderData.price).toLocaleString('vi-VN')} VNĐ</p>
                            <p>Thời gian đặt: ${new Date(orderData.time).toLocaleString('vi-VN')}</p>
                            <p>Ghi chú: ${orderData.note}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `Đơn hàng mới #${orderData.orderReference}`,
            html
        });
        
        console.log(`[${new Date().toISOString()}] New order notification email sent: ${info.messageId}`);
        return true;
    } catch (error: any) {
        console.error(`[${new Date().toISOString()}] New order notification email failed:`, error.message);
        return false;
    }
};