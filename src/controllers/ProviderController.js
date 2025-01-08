const providerService = require("../services/ProviderService");

class ProviderController {
  async getProviders(req, res) {
    try {
        const { keyword } = req.query;
        const providers = await providerService.getProviders(keyword);
        
        return res.status(200).json({
            status: "success",
            message: "Providers retrieved successfully",
            data: providers
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
  }

  async createProvider(req, res) {
    try {
      const newProvider = await providerService.createProvider(req.body);
      res.status(201).json(newProvider);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateProvider(req, res) {
    try {
      const id = req.params.id;
      const providerData = {
        email: req.body.email,
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
      };
      const updatedProvider = await providerService.updateProvider(id, providerData);
      res.status(200).json(updatedProvider);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProviderDetails(req, res) {
    try {
      const id  = req.params.id;
      const provider = await providerService.getProviderById(id);
      res.status(200).json(provider);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Delete a provider by ID
    async deleteProvider(req, res) {
      try {
        const { id } = req.params;
        const result = await providerService.deleteProvider(id);
        return res.status(200).json(result);
      } catch (error) {
        return res.status(404).json({
          status: "error",
          message: error.message,
        });
      }
    }
}

module.exports = new ProviderController();

