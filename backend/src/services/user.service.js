import userProfileModel from "../models/userprofile.model.js";

const userProfileService = {

  getProfile: async (user_id) => {
    const profile = await userProfileModel.getWithUserInfo(user_id);
    if (!profile) {
      throw new Error("Profile không tồn tại");
    }
    return profile;
  },

  updateProfile: async (user_id, updates) => {
    const allowedFields = ["avatar_url", "weekly_goal"];
    const safeUpdates = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      throw new Error("Không có dữ liệu hợp lệ để cập nhật");
    }

    const ok = await userProfileModel.updateByUserId(user_id, safeUpdates);
    if (!ok) {
      throw new Error("Cập nhật profile thất bại");
    }

    return true;
  }
};

export default userProfileService;
