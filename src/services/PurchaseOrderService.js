const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrderModel");
const PurchaseOrderDetailService = require("../services/PurchaseOrderDetailService");
const ProductService = require("../services/ProductService");

class PurchaseOrderService {
  // Create a new purchaseOrder
  async createPurchaseOrder(data) {
    try {
      const purchaseOrderDetails = data.purchaseDetail;
      let totalPrice = 0;
      let purchaseDetailIds = []
      for (const detail of purchaseOrderDetails) {
        // Create a new product
        // "name, sellingPrice, stockQuantity, category, images"
        const productData = {
          name: detail.name,
          sellingPrice: detail.sellingPrice,
          stockQuantity: detail.stockQuantity,
          category: detail.category._id,
          images: detail.images,
        };
        const product = await ProductService.createProduct(productData);

        //Create a new PurchaseOrderDetail
        const purchaseOrderDetailData = {
          product: product.data._id,
          expireDate: detail.expireDate,
          importPrice: detail.importPrice,
          quantity: detail.stockQuantity,
        };
        const purchaseOrderDetail = await PurchaseOrderDetailService.createPurchaseOrderDetail(purchaseOrderDetailData);
        purchaseDetailIds.push(new mongoose.Types.ObjectId(purchaseOrderDetail.data._id));
        totalPrice += detail.importPrice * detail.stockQuantity;
      };
      data.provider = new mongoose.Types.ObjectId(data.provider);
      const purchaseOrderData = {
        provider: data.provider,
        orderDate: data.orderDate,
        totalPrice: totalPrice,
        purchaseDetail: purchaseDetailIds,
      };
      const purchaseOrder = await PurchaseOrder.create(purchaseOrderData);
      return {
        status: "success",
        message: "PurchaseOrder created successfully",
        data: purchaseOrder,
      };
    } catch (error) {
      throw new Error("Failed to create purchaseOrder: " + error.message);
    }
  }

  async getPurchaseOrders(provider, startDate, endDate) {
    try {
      const query = {};
      if (provider) query.provider = new mongoose.Types.ObjectId(provider);
      if (startDate) query.orderDate = { ...query.orderDate, $gte: new Date(startDate) };
      if (endDate) query.orderDate = { ...query.orderDate, $lte: new Date(endDate) };
      const purchaseOrders = await PurchaseOrder.find(query)
        .populate({
          path: 'purchaseDetail',
          populate: {
              path: 'product',
              populate: {
                path: 'category',
              }
          },
        })
        .populate('provider');
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
              _id : detail.product.category._id,
              name: detail.product.category.name
            },
            sellingPrice: detail.product.sellingPrice,
            stockQuantity: detail.product.stockQuantity,
          };
          purchaseDetail.push(purchaseOrderDetailData);
        };
        const purchaseOrderData = {
          _id: purchaseOrder._id,
          provider: {
            _id: purchaseOrder.provider._id,
            name: purchaseOrder.provider.name,
          },
          orderDate: purchaseOrder.orderDate,
          totalPrice: purchaseOrder.totalPrice,
          purchaseDetail: purchaseDetail,
        }
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
        path: 'purchaseDetail',
        populate: {
            path: 'product',
            populate: {
              path: 'category',
            }
        },
      })
      .populate('provider');
      if (!oldPurchaseOrder) {
        throw new Error("PurchaseOrder not found");
      }
      
      // Danh sách cần cập nhật
      const purchaseOrderDetails = data.purchaseDetail;

      let totalPrice = oldPurchaseOrder.totalPrice;
      for (const detail of purchaseOrderDetails) {
        const oldPurchaseOrderDetail = await PurchaseOrderDetailService.getPurchaseOrderDetailById(detail._id);
        const productId = oldPurchaseOrderDetail.product._id.toString();
        // Validate quantity
        const product = await ProductService.getProductById(productId);
        if (oldPurchaseOrder.purchaseDetail.quantity - detail.stockQuantity > product.stockQuantity) {
          throw new Error("Invalid quantity!");
        }
        
        // Update totalPrice
        totalPrice += detail.importPrice * detail.stockQuantity - oldPurchaseOrderDetail.importPrice * oldPurchaseOrderDetail.quantity;
        // Update product
        // "name, sellingPrice, stockQuantity, category, images"
        const selledQuantity = oldPurchaseOrderDetail.quantity - product.stockQuantity;
        const productData = {
          name: detail.name,
          sellingPrice: detail.sellingPrice,
          stockQuantity: detail.stockQuantity - selledQuantity,
          category: detail.category._id,
          images: detail.images,
        };
        const newProduct = await ProductService.updateProduct(productId, productData);

        //Update PurchaseOrderDetail
        const purchaseOrderDetailData = {
          expireDate: detail.expireDate,
          importPrice: detail.importPrice,
          quantity: detail.stockQuantity,
        };
        const newPurchaseOrderDetail = await PurchaseOrderDetailService.updatePurchaseOrderDetail(detail._id, purchaseOrderDetailData);
      };
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
