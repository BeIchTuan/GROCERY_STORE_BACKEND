const Invoice = require("../models/InvoiceModel");
const InvoiceDetail = require("../models/InvoiceDetailModel");
const PurchaseOrder = require("../models/PurchaseOrderModel");

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
              ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
              : interval === "year"
              ? { $dateToString: { format: "%Y", date: "$createdAt" } }
              : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
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

    const invoiceData = await Invoice.aggregate([
      matchStage,
      invoiceGroupStage,
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
}

module.exports = new ReportService();
