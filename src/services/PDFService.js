const PDFDocument = require('pdfkit');
const path = require('path');

class PDFService {
    async generateInvoicePDF(invoice) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A6', // Khổ A6
                    margin: 15,
                });

                // Đăng ký font
                doc.registerFont('Roboto-Regular', path.join(__dirname, '../fonts/Roboto-Regular.ttf'));
                doc.registerFont('Roboto-Bold', path.join(__dirname, '../fonts/Roboto-Bold.ttf'));

                // Header
                

                // Tiêu đề hóa đơn
                doc.moveDown(0.3);
                doc.fontSize(14).font('Roboto-Bold').text('HÓA ĐƠN BÁN HÀNG', { align: 'center' });
                doc.fontSize(8).font('Roboto-Regular').text(`Số: ${invoice._id}`, { align: 'center' });
                doc.text(`Ngày: ${new Date(invoice.createdAt).toLocaleDateString('vi-VN')}`, { align: 'center' });

                // Thông tin khách hàng
                doc.moveDown(0.5);
                doc.fontSize(9).font('Roboto-Regular').text(`Khách hàng: ${invoice.customer.name}`);
                doc.text(`ĐT: ${invoice.customer.phone}`);

                // Bảng chi tiết
                const columnPositions = { stt: 20, ten: 40, sl: 140, gia: 170, tt: 210 };
                const startY = doc.y;

                // Header bảng
                doc.fontSize(8).font('Roboto-Bold');
                doc.text('STT', columnPositions.stt, startY);
                doc.text('Tên SP', columnPositions.ten, startY);
                doc.text('SL', columnPositions.sl, startY);
                doc.text('Đ.Giá', columnPositions.gia, startY);
                doc.text('T.Tiền', columnPositions.tt, startY);

                const detailStartY = startY + 15;

                // Nội dung bảng
                doc.font('Roboto-Regular');
                let currentY = detailStartY;
                invoice.invoiceDetails.forEach((item, index) => {
                    const y = detailStartY + index * 12;
                    currentY = y;
                    doc.text(index + 1, columnPositions.stt, y);
                    doc.text(item.product.name.substring(0, 20), columnPositions.ten, y); // Tối đa 20 ký tự
                    doc.text(item.quantity.toString(), columnPositions.sl, y);
                    doc.text(item.product.sellingPrice.toLocaleString('vi-VN'), columnPositions.gia, y);
                    doc.text((item.quantity * item.product.sellingPrice).toLocaleString('vi-VN'), columnPositions.tt, y);
                });

                // Tổng kết hóa đơn
                const summaryStartY = currentY + 15;
                doc.moveDown(1);
                doc.font('Roboto-Bold');
                const total = invoice.totalPrice;
                const vat = total * 0.1;
                const totalWithVAT = total + vat;

                doc.text(`Tổng cộng: ${total.toLocaleString('vi-VN')} VNĐ`, 20, summaryStartY);
                
                // Lấy chiều cao thực tế của nội dung
                const actualHeight = doc.y + 20; // Thêm 20 để có padding dưới
                
                // Điều chỉnh kích thước trang
                doc.page.height = actualHeight;
                
                // Kết thúc tài liệu
                doc.end();
                resolve(doc);
            } 
            catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new PDFService();
