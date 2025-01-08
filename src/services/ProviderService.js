const Provider = require("../models/ProviderModel");

class ProviderService {
  // Create a new provider
  async createProvider(data) {
    try {
      const provider = await Provider.create(data);
      return {
        status: "success",
        message: "Provider created successfully",
        data: provider,
      };
    } catch (error) {
      throw new Error("Failed to create provider: " + error.message);
    }
  }

  async getProviders() {
    try {
      return await Provider.find();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getProviderById(id) {
    try {
      return await Provider.findById(id);
    } catch (error) {
      throw new Error(error.message);
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

      return {
        status: "success",
        message: "Provider updated successfully",
        data: updatedProvider,
      };
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
      return {
        status: "success",
        message: "Provider deleted successfully",
      };
    } catch (error) {
      throw new Error("Failed to delete provider: " + error.message);
    }
  }

  // Thêm method mới
  async searchProviders(searchTerm) {
    try {
      if (!searchTerm) {
        return await Provider.find();
      }

      return await Provider.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { phoneNumber: { $regex: searchTerm, $options: 'i' } }
        ]
      });
    } catch (error) {
      throw new Error('Error searching providers: ' + error.message);
    }
  }
}

module.exports = new ProviderService();
