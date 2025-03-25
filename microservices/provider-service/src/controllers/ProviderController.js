const ProviderService = require("../services/ProviderService");

class ProviderController {
  async getProviders(req, res) {
    try {
      const { keyword } = req.query;
      const providers = await ProviderService.getProviders(keyword);

      return res.status(200).json({
        status: "success",
        message: "Providers retrieved successfully",
        data: providers,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async createProvider(req, res) {
    try {
      const newProvider = await ProviderService.createProvider(req.body);
      return res.status(201).json({
        status: "success",
        message: "Provider created successfully",
        data: newProvider,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async updateProvider(req, res) {
    try {
      const id = req.params.id;
      const providerData = req.body;
      const updatedProvider = await ProviderService.updateProvider(
        id,
        providerData
      );

      return res.status(200).json({
        status: "success",
        message: "Provider updated successfully",
        data: updatedProvider,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getProviderDetails(req, res) {
    try {
      const id = req.params.id;
      const provider = await ProviderService.getProviderById(id);

      if (!provider) {
        return res.status(404).json({
          status: "error",
          message: "Provider not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Provider found",
        data: provider,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async deleteProvider(req, res) {
    try {
      const { id } = req.params;
      const result = await ProviderService.deleteProvider(id);

      return res.status(200).json({
        status: "success",
        message: "Provider deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

module.exports = new ProviderController();
