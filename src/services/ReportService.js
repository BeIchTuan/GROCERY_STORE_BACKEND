const Invoice = require("../models/InvoiceModel");
const InvoiceDetail = require("../models/InvoiceDetailModel");
const PurchaseOrder = require("../models/PurchaseOrderModel");
const PurchaseOrderDetail = require("../models/PurchaseOrderDetailModel");
const Category = require("../models/CategoriesModel");
const Provider = require("../models/ProviderModel");

class ReportService {
  async calculateRevenue({ startDate, endDate, interval, groupBy }) {
    const matchStage = {
      $match: {
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { $gte: new Date(startDate) } : {}),
                ...(endDate ? { $lte: new Date(endDate) } : {}),
              },
            }
          : {}),
      },
    };

    const groupStage = {
      $group: {
        _id: {
          interval:
            interval === "month"
              ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } } // Nhóm theo tháng
              : interval === "year"
              ? { $dateToString: { format: "%Y", date: "$createdAt" } } // Nhóm theo năm
              : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Nhóm theo ngày
          groupBy:
            groupBy === "product"
              ? "$productId"
              : groupBy === "category"
              ? "$categoryId"
              : null,
        },
        revenue: { $sum: "$totalPrice" },
      },
    };

    const sortStage = {
      $sort: {
        "_id.interval": 1, // Sắp xếp tăng dần theo `interval`
      },
    };

    const projectStage = {
      $project: {
        _id: 0,
        interval: "$_id.interval",
        groupBy: "$_id.groupBy",
        revenue: 1,
      },
    };

    const data = await Invoice.aggregate([
      matchStage,
      groupStage,
      sortStage,
      projectStage,
    ]);

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const labels = data.map((item) => item.interval);
    const revenue = data.map((item) => item.revenue);

    return { chartData: { labels, revenue }, totalRevenue };
  }

  async calculateProfit({ startDate, endDate, interval }) {
    const matchStage = {
      $match: {
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { $gte: new Date(startDate) } : {}),
                ...(endDate ? { $lte: new Date(endDate) } : {}),
              },
            }
          : {}),
      },
    };

    const invoiceGroupStage = {
      $group: {
        _id: {
          interval:
            interval === "month"
              ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } } // Nhóm theo tháng
              : interval === "year"
              ? { $dateToString: { format: "%Y", date: "$createdAt" } } // Nhóm theo năm
              : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        totalRevenue: { $sum: "$totalPrice" },
      },
    };

    const purchaseGroupStage = {
      $group: {
        _id: null,
        totalCost: { $sum: "$totalPrice" },
      },
    };

    const sortStage = {
      $sort: {
        "_id.interval": 1,
      },
    };

    const invoiceData = await Invoice.aggregate([
      matchStage,
      invoiceGroupStage,
      sortStage,
    ]);

    const purchaseData = await PurchaseOrder.aggregate([
      matchStage,
      purchaseGroupStage,
    ]);

    const totalCost = purchaseData.length > 0 ? purchaseData[0].totalCost : 0;
    console.log(totalCost);

    const data = invoiceData.map((item) => ({
      interval: item._id.interval,
      profit: item.totalRevenue - totalCost,
    }));

    const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
    const labels = data.map((item) => item.interval);
    const profit = data.map((item) => item.profit);

    return { chartData: { labels, profit }, totalProfit };
  }

  async calculateSales({ startDate, endDate, interval }) {
    // Lookup from InvoiceDetail to Invoice to get createdAt
    const lookupInvoiceStage = {
      $lookup: {
        from: "invoices", // Collection name for Invoice
        localField: "_id", // InvoiceDetail _id
        foreignField: "invoiceDetails", // Field linking to Invoice
        as: "invoice",
      },
    };

    // Extract createdAt from Invoice 
    const addFieldsStage = {
      $addFields: {
        createdAt: { $arrayElemAt: ["$invoice.createdAt", 0] },
      },
    };

    // Filter by startDate and endDate
    const matchStage = {
      $match: {
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { $gte: new Date(startDate) } : {}),
                ...(endDate ? { $lte: new Date(endDate) } : {}),
              },
            }
          : {}),
      },
    };

    // Group by interval (day, month, year) and sum quantity
    const groupStage = {
      $group: {
        _id: {
          interval: {
            $dateToString: {
              format:
                interval === "month"
                  ? "%Y-%m"
                  : interval === "year"
                  ? "%Y"
                  : "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          product: "$product",
        },
        sales: { $sum: "$quantity" },
      },
    };

    // Lookup product details
    const lookupProductStage = {
      $lookup: {
        from: "products",
        localField: "_id.product",
        foreignField: "_id",
        as: "productDetails",
      },
    };

    // Format the result
    const projectStage = {
      $project: {
        _id: 0,
        interval: "$_id.interval",
        product: {
          $ifNull: [
            { $arrayElemAt: ["$productDetails", 0] },
            { name: "Deleted Product" },
          ],
        },
        sales: 1,
      },
    };

    // Perform aggregation
    const data = await InvoiceDetail.aggregate([
      lookupInvoiceStage,
      addFieldsStage,
      matchStage,
      groupStage,
      lookupProductStage,
      projectStage,
    ]);

    // Calculate bestsellers
    const bestsellers = await InvoiceDetail.aggregate([
      lookupInvoiceStage,
      addFieldsStage,
      matchStage,
      {
        $group: {
          _id: "$product",
          quantitySold: { $sum: "$quantity" },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
      lookupProductStage,
      projectStage,
    ]);

    // Calculate slow sellers
    const slowSellers = await InvoiceDetail.aggregate([
      lookupInvoiceStage,
      addFieldsStage,
      matchStage,
      {
        $group: {
          _id: "$product",
          quantitySold: { $sum: "$quantity" },
        },
      },
      { $sort: { quantitySold: 1 } },
      { $limit: 5 },
      lookupProductStage,
      projectStage,
    ]);

    // Calculate total sales and labels
    const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
    const labels = data.map((item) => item.interval || "Unknown");
    const sales = data.map((item) => item.sales);

    return {
      chartData: { labels, sales },
      bestsellers,
      slowSellers,
      totalSales,
    };
  }

  async getStockByCategory(threshold) {
    try {
      return await Category.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products',
          },
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          name: 1,
          products: {
            $map: {
              input: {
                $filter: {
                  input: '$products',
                  as: 'product',
                  cond: threshold
                    ? { $lt: ['$$product.stockQuantity', threshold] }
                    : true,
                },
              },
              as: 'product',
              in: {
                productId: '$$product._id',
                name: '$$product.name',
                stockQuantity: '$$product.stockQuantity',
              },
            },
          },
        },
      },
      ]);
    } catch (error) {
      throw new Error(`Failed to fetch stock by category: ${error.message}`);
    }
  }

  async getExpiringProducts(startDate, endDate) {
    try {
      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error("The 'startDate' must be earlier than 'endDate'.");
      }
      const expiringProducts = await PurchaseOrderDetail.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $match: {
            expireDate: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $project: {
            _id: 0,
            productId: '$product._id',
            name: '$product.name',
            expireDate: 1,
            stockQuantity: '$product.stockQuantity'
          }
        }
      ]);
      return { expiringProducts };
    } catch (error) {
      throw new Error(`Failed to fetch expiring products: ${error.message}`);
    }
  }

  async getImportsByProvider(startDate, endDate) {
    try {
      if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        throw new Error("The 'startDate' must be earlier than 'endDate'.");
      }
  
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date();
  
      const providers = await Provider.aggregate([
        {
          $lookup: {
            from: 'purchaseorders',
            localField: '_id',
            foreignField: 'provider',
            as: 'purchaseOrders'
          }
        },
        {
          $unwind: '$purchaseOrders'
        },
        {
          $match: {
            'purchaseOrders.orderDate': { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$_id',
            providerId: { $first: '$_id' },
            name: { $first: '$name' },
            totalImportPrice: { $sum: '$purchaseOrders.totalPrice' },
            purchaseOrders: {
              $push: {
                orderId: '$purchaseOrders._id',
                orderDate: '$purchaseOrders.orderDate',
                totalPrice: '$purchaseOrders.totalPrice'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            providerId: 1,
            name: 1,
            totalImportPrice: 1,
            purchaseOrders: 1
          }
        }
      ]);
      return { providers };
    } catch (error) {
      throw new Error(`Failed to fetch imports by provider: ${error.message}`);
    }
  }

  async getTopSellingProducts(startDate, endDate, limit) {
    try {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end && start >= end) {
        throw new Error("The 'startDate' must be earlier than 'endDate'.");
      }
      const dateFilter = {};
      if (startDate) dateFilter.orderDate = { $gte: startDate };
      if (endDate) dateFilter.orderDate = { ...dateFilter.orderDate, $lte: endDate };
  
      const products = await PurchaseOrderDetail.aggregate([
        {
          $group: {
            _id: '$product',
            totalQuantitySold: { $sum: '$quantity' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        {
          $unwind: '$productDetails'
        },
        {
          $project: {
            productId: '$productDetails._id',
            productName: '$productDetails.name',
            totalQuantitySold: 1
          }
        },
        {
          $sort: { totalQuantitySold: -1 }
        },
        {
          $limit: limit ? parseInt(limit) : 10,
        }
      ]);
  
      return { topSellingProducts: products };
    } catch (error) {
      throw new Error(`Failed to fetch top selling products: ${error.message}`);
    }
  }
}

module.exports = new ReportService();
