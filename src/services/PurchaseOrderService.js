const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrderModel");
const PurchaseOrderDetail = require("../models/PurchaseOrderDetailModel");
const Product = require("../models/ProductModel");
const ProductService = require("../services/ProductService");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
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
          images: [],
        };

        const filesForDetail = files.filter(
          (file) => file.fieldname === `purchaseDetail[${i}][files]`
        );

        const imageUrls = [];
        if (files && filesForDetail.length > 0) {
          for (const file of filesForDetail) {
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
          expireDate: detail.expireDate,
          category: detail.category._id,
          images: detail.images,
          importDate: new Date(),
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
        purchaseDetail: purchaseDetailIds,
      });

      return { success: true, purchaseOrder };
    } catch (error) {
      console.error("Error in PurchaseOrderService:", error);
      throw new Error("Failed to create purchase order");
    }
  }

  async updatePurchaseOrder(id, data, files) {
    const { purchaseDetail, provider, orderDate, totalPurchaseDetail } = data;

    const purchaseOrder = await PurchaseOrder.findById(id).populate(
      "purchaseDetail",
      "_id"
    );
    if (!purchaseOrder) {
      throw new Error("Purchase order not found");
    }

    if (provider) purchaseOrder.provider = provider;
    if (orderDate) purchaseOrder.orderDate = orderDate;

    let totalPrice = 0;

    if (Array.isArray(purchaseDetail)) {
      for (let i = 0; i < purchaseDetail.length; i++) {
        const detail = purchaseDetail[i];
        if (typeof detail === "object" && detail.id) {
          const {
            id,
            name,
            sellingPrice,
            stockQuantity,
            category,
            importPrice,
            expireDate,
            importDate,
            deleteImages,
          } = detail;

          const purchaseOrderDetail = await PurchaseOrderDetail.findById(id);
          if (!purchaseOrderDetail) {
            throw new Error(`Purchase order detail not found for ID ${id}`);
          }

          const product = await Product.findById(purchaseOrderDetail.product);
          if (!product) {
            throw new Error(`Product not found for detail ID ${id}`);
          }

          if (files) {
            const filesForDetail = files.filter(
              (file) => file.fieldname === `purchaseDetail[${i}][files]`
            );

            const imageUrls = [];
            if (filesForDetail.length > 0) {
              for (const file of filesForDetail) {
                const result = await uploadToCloudinary(
                  file.buffer,
                  "products"
                );
                imageUrls.push(result.secure_url);
              }

              if (imageUrls.length > 0) {
                product.images = imageUrls;
              }
            }
          }

          if (name) {
            product.name = name;
          }
          if (sellingPrice) {
            product.sellingPrice = sellingPrice;
          }
          if (stockQuantity) {
            purchaseOrderDetail.quantity = stockQuantity;
            product.stockQuantity = stockQuantity;
          }
          if (category) {
            product.category = category;
          }
          if (importPrice) {
            purchaseOrderDetail.importPrice = importPrice;
          }
          if (expireDate) {
            purchaseOrderDetail.expireDate = expireDate;
            product.expireDate = expireDate;
          }
          if (importDate) {
            product.importDate = importDate;
          }

          if (importPrice !== undefined && stockQuantity !== undefined) {
            totalPrice += importPrice * stockQuantity;
            purchaseOrder.totalPrice = totalPrice;
          }

          if (deleteImages && deleteImages.length > 0) {
            const imagesToDelete =
              typeof deleteImages === "string"
                ? JSON.parse(deleteImages)
                : deleteImages;

            if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
              for (const url of imagesToDelete) {
                const publicId = extractPublicId(url);
                await deleteFromCloudinary(publicId);
              }

              product.images = product.images.filter(
                (imageUrl) => !imagesToDelete.includes(imageUrl)
              );
            }
          }

          await purchaseOrderDetail.save();
          await product.save();
          await purchaseOrder.save();
        } else {
          throw new Error(
            "Invalid purchaseDetail structure. Each item must be an object with an ID."
          );
        }
      }
    } else {
      throw new Error(
        "Invalid purchaseDetail format. Must be an array of objects."
      );
    }

    await purchaseOrder.save();

    return purchaseOrder;
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

        // Lặp qua purchaseDetail của từng purchaseOrder
        for (const detail of purchaseOrder.purchaseDetail) {
          const purchaseOrderDetailData = {
            _id: detail._id,
            importPrice: detail.importPrice,
            expireDate: detail.expireDate,
            images: detail.product?.images || [],
            name: detail.product?.name || "Unknown",
            category: {
              _id: detail.product?.category?._id || null,
              name: detail.product?.category?.name || "Unknown",
            },
            sellingPrice: detail.product?.sellingPrice || 0,
            stockQuantity: detail.product?.stockQuantity || 0,
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
}

module.exports = new PurchaseOrderService();
