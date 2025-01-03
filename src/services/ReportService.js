const Invoice = require("../models/InvoiceModel");
const InvoiceDetail = require("../models/InvoiceDetailModel");
const PurchaseOrder = require("../models/PurchaseOrderModel");
const PurchaseOrderDetail = require("../models/PurchaseOrderDetailModel");
const Category = require("../models/CategoriesModel");
const Provider = require("../models/ProviderModel");
const Product = require("../models/ProductModel");

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
    // Validate input
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error("The 'startDate' must be earlier than 'endDate'.");
    }

    // Prepare match conditions for filtering by date
    const matchConditions = {};
    if (startDate) matchConditions.createdAt = { $gte: new Date(startDate) };
    if (endDate)
      matchConditions.createdAt = {
        ...matchConditions.createdAt,
        $lte: new Date(endDate),
      };

    // Aggregate sales data
    const salesData = await InvoiceDetail.aggregate([
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "invoiceDetails",
          as: "invoices",
        },
      },
      { $unwind: "$invoices" },
      { $match: matchConditions },
      {
        $group: {
          _id: {
            product: "$product",
            interval: {
              $dateToString: {
                format:
                  interval === "year"
                    ? "%Y"
                    : interval === "month"
                    ? "%Y-%m"
                    : "%Y-%m-%d",
                date: "$invoices.createdAt",
              },
            },
          },
          quantitySold: { $sum: "$quantity" },
        },
      },
      {
        $group: {
          _id: "$_id.interval",
          sales: { $sum: "$quantitySold" },
          details: {
            $push: { product: "$_id.product", quantitySold: "$quantitySold" },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Transform data into chart format
    const chartData = {
      labels: salesData.map((data) => data._id),
      sales: salesData.map((data) => data.sales),
    };

    // Calculate bestsellers and slow sellers
    const productSales = await InvoiceDetail.aggregate([
      {
        $group: {
          _id: "$product",
          quantitySold: { $sum: "$quantity" },
        },
      },
      { $sort: { quantitySold: -1 } },
    ]);

    const bestsellers = await Promise.all(
      productSales.slice(0, 3).map(async (item) => {
        const product = await Product.findById(item._id);
        return product
          ? {
              productId: item._id,
              name: product.name,
              quantitySold: item.quantitySold,
            }
          : {
              productId: item._id,
              name: "Unknown Product",
              quantitySold: item.quantitySold,
            };
      })
    );

    const slowSellers = await Promise.all(
      productSales.slice(-3).map(async (item) => {
        const product = await Product.findById(item._id);
        return product
          ? {
              productId: item._id,
              name: product.name,
              quantitySold: item.quantitySold,
            }
          : {
              productId: item._id,
              name: "Unknown Product",
              quantitySold: item.quantitySold,
            };
      })
    );

    return {
      chartData,
      bestsellers: await Promise.all(bestsellers),
      slowSellers: await Promise.all(slowSellers),
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
