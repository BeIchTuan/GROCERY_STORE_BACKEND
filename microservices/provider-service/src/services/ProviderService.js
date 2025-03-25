const Provider = require("../models/ProviderModel");

class ProviderService {
  // Create a new provider
  async createProvider(data) {
    try {
      const provider = await Provider.create(data);
      return provider;
    } catch (error) {
      throw new Error("Failed to create provider: " + error.message);
    }
  }

  // Get all providers with optional keyword search
  async getProviders(keyword = "") {
    try {
      let query = {};
      if (keyword) {
        query = {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { email: { $regex: keyword, $options: "i" } },
            { phoneNumber: { $regex: keyword, $options: "i" } },
          ],
        };
      }

      const providers = await Provider.find(query).sort({ createdAt: -1 });
      return providers;
    } catch (error) {
      throw new Error("Failed to fetch providers: " + error.message);
    }
  }

  // Get a provider by ID
  async getProviderById(id) {
    try {
      return await Provider.findById(id);
    } catch (error) {
      throw new Error("Failed to find provider: " + error.message);
    }
  }

  // Update a provider by ID
  async updateProvider(id, data) {
    try {
      const provider = await Provider.findById(id);
      if (!provider) {
        throw new Error("Provider not found");
      }

      // Update fields
      Object.assign(provider, data);
      const updatedProvider = await provider.save();

      return updatedProvider;
    } catch (error) {
      throw new Error("Failed to update provider: " + error.message);
    }
  }

  // Delete a provider by ID
  async deleteProvider(id) {
    try {
      const provider = await Provider.findByIdAndDelete(id);
      if (!provider) {
        throw new Error("Provider not found");
      }
      return { success: true };
    } catch (error) {
      throw new Error("Failed to delete provider: " + error.message);
    }
  }
}

module.exports = new ProviderService();
