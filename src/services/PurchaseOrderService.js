const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrderModel");
const PurchaseOrderDetail = require("../models/PurchaseOrderDetailModel");
const PurchaseOrderDetailService = require("../services/PurchaseOrderDetailService");
const ProductService = require("../services/ProductService");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/uploadImage");

class PurchaseOrderService {
  async createPurchaseOrder(data, files) {
    const { provider, orderDate, totalPurchaseDetail } = data;
    const purchaseDetails = [];
    try {
      for (let i = 0; i < totalPurchaseDetail; i++) {
        const detail = {
          name: data.purchaseDetail[i].name,
          sellingPrice: parseFloat(data.purchaseDetail[i].sellingPrice),
          stockQuantity: parseInt(data.purchaseDetail[i].stockQuantity),
          category: {
            _id: data.purchaseDetail[i].category?._id,
            name: data.purchaseDetail[i].category?.name,
          },
          importPrice: parseFloat(data.purchaseDetail[i].importPrice),
          expireDate: data.purchaseDetail[i].expireDate,
          // images: files.filter(
          //   (file) => file.fieldname === `purchaseDetail[${i}][files]`
          // ),
          images: [],
        };

        const filesForDetail = files.filter(
          (file) => file.fieldname === `purchaseDetail[${i}][files]`
        );

        const imageUrls = [];
        if (files && files.length > 0) {
          for (const file of files) {
            const result = await uploadToCloudinary(file.buffer, "products");
            imageUrls.push(result.secure_url);
          }
        }

        detail.images = imageUrls;

        purchaseDetails.push(detail);
      }

      const newProducts = [];
      for (let i = 0; i < purchaseDetails.length; i++) {
        const detail = purchaseDetails[i];
        const productData = {
          name: detail.name,
          sellingPrice: detail.sellingPrice,
          stockQuantity: detail.stockQuantity,
          category: detail.category._id,
          images: detail.images,
        };

        const product = await ProductService.createProduct(productData);
        newProducts.push(product);


        purchaseDetails[i]._id = product._id;
      }

      let totalPrice = 0;
      const purchaseDetailIds = [];
      for (const detail of purchaseDetails) {
        const purchaseOrderDetail = await PurchaseOrderDetail.create({
          product: detail._id, 
          importPrice: detail.importPrice,
          quantity: detail.stockQuantity,
          expireDate: detail.expireDate,
          images: detail.images,
        });
        purchaseDetailIds.push(purchaseOrderDetail._id);
        totalPrice += detail.importPrice * detail.stockQuantity;
      }

      const purchaseOrder = await PurchaseOrder.create({
        provider,
        orderDate,
        totalPrice,
        purchaseDetail: purchaseDetailIds, // Link all PurchaseOrderDetails
      });

      return { success: true, purchaseOrder };
    } catch (error) {
      console.error("Error in PurchaseOrderService:", error);
      throw new Error("Failed to create purchase order");
    }
  }

  async getPurchaseOrders(provider, startDate, endDate) {
    try {
      const query = {};
      if (provider) query.provider = new mongoose.Types.ObjectId(provider);
      if (startDate)
        query.orderDate = { ...query.orderDate, $gte: new Date(startDate) };
      if (endDate)
        query.orderDate = { ...query.orderDate, $lte: new Date(endDate) };
      const purchaseOrders = await PurchaseOrder.find(query)
        .populate({
          path: "purchaseDetail",
          populate: {
            path: "product",
            populate: {
              path: "category",
            },
          },
        })
        .populate("provider");
      let data = [];
      for (const purchaseOrder of purchaseOrders) {
        let purchaseDetail = [];
        for (const detail of purchaseOrder.purchaseDetail) {
          const purchaseOrderDetailData = {
            _id: detail._id,
            importPrice: detail.importPrice,
            expireDate: detail.expireDate,
            images: detail.product.images,
            name: detail.product.name,
            category: {
              _id: detail.product.category._id,
              name: detail.product.category.name,
            },
            sellingPrice: detail.product.sellingPrice,
            stockQuantity: detail.product.stockQuantity,
          };
          purchaseDetail.push(purchaseOrderDetailData);
        }
        const purchaseOrderData = {
          _id: purchaseOrder._id,
          provider: {
            _id: purchaseOrder.provider._id,
            name: purchaseOrder.provider.name,
          },
          orderDate: purchaseOrder.orderDate,
          totalPrice: purchaseOrder.totalPrice,
          purchaseDetail: purchaseDetail,
        };
        data.push(purchaseOrderData);
      }
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Update a purchaseOrder by ID
  async updatePurchaseOrder(id, data) {
    try {
      const oldPurchaseOrder = await PurchaseOrder.findById(id)
        .populate({
          path: "purchaseDetail",
          populate: {
            path: "product",
            populate: {
              path: "category",
            },
          },
        })
        .populate("provider");
      if (!oldPurchaseOrder) {
        throw new Error("PurchaseOrder not found");
      }

      // Danh sách cần cập nhật
      const purchaseOrderDetails = data.purchaseDetail;

      let totalPrice = oldPurchaseOrder.totalPrice;
      for (const detail of purchaseOrderDetails) {
        const oldPurchaseOrderDetail =
          await PurchaseOrderDetailService.getPurchaseOrderDetailById(
            detail._id
          );
        const productId = oldPurchaseOrderDetail.product._id.toString();
        // Validate quantity
        const product = await ProductService.getProductById(productId);
        if (
          oldPurchaseOrder.purchaseDetail.quantity - detail.stockQuantity >
          product.stockQuantity
        ) {
          throw new Error("Invalid quantity!");
        }

        // Update totalPrice
        totalPrice +=
          detail.importPrice * detail.stockQuantity -
          oldPurchaseOrderDetail.importPrice * oldPurchaseOrderDetail.quantity;
        // Update product
        // "name, sellingPrice, stockQuantity, category, images"
        const selledQuantity =
          oldPurchaseOrderDetail.quantity - product.stockQuantity;
        const productData = {
          name: detail.name,
          sellingPrice: detail.sellingPrice,
          stockQuantity: detail.stockQuantity - selledQuantity,
          category: detail.category._id,
          images: detail.images,
        };
        const newProduct = await ProductService.updateProduct(
          productId,
          productData
        );

        //Update PurchaseOrderDetail
        const purchaseOrderDetailData = {
          expireDate: detail.expireDate,
          importPrice: detail.importPrice,
          quantity: detail.stockQuantity,
        };
        const newPurchaseOrderDetail =
          await PurchaseOrderDetailService.updatePurchaseOrderDetail(
            detail._id,
            purchaseOrderDetailData
          );
      }
      const purchaseOrderData = {
        orderDate: data.orderDate,
        totalPrice: totalPrice,
      };

      Object.assign(oldPurchaseOrder, purchaseOrderData);
      const newPurchaseOrder = await oldPurchaseOrder.save();

      return {
        status: "success",
        message: "PurchaseOrder updated successfully",
        data: newPurchaseOrder,
      };
    } catch (error) {
      throw new Error("Failed to update purchaseOrder: " + error.message);
    }
  }
}

module.exports = new PurchaseOrderService();
