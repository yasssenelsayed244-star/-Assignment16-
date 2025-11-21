import bcrypt from "bcrypt";
import userRepository from "../modules/user/user.repository";

const DEFAULT_ADMIN_NAME = "Abdelrahman elsayed";
const DEFAULT_ADMIN_EMAIL = "abdelrahmanelsayesnoname@gmail.com";

export const ensureDefaultAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.warn("[bootstrap] ADMIN_PASSWORD not provided. Skipping default admin creation.");
      return;
    }

    const existingAdmin = await userRepository.findByEmail(adminEmail);
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (existingAdmin) {
      let shouldSave = false;

      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        shouldSave = true;
      }

      if (!existingAdmin.isEmailVerified) {
        existingAdmin.isEmailVerified = true;
        shouldSave = true;
      }

      // Always sync password with provided one to ensure access
      existingAdmin.password = hashedPassword;
      shouldSave = true;

      if (existingAdmin.name !== adminName) {
        existingAdmin.name = adminName;
        shouldSave = true;
      }

      if (shouldSave) {
        await existingAdmin.save();
        console.log(`[bootstrap] Default admin synced: ${adminEmail}`);
      } else {
        console.log(`[bootstrap] Default admin already up-to-date: ${adminEmail}`);
      }
      return;
    }

    await userRepository.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true
    } as any);

    console.log(`[bootstrap] Default admin created: ${adminEmail}`);
  } catch (error) {
    console.error("[bootstrap] Failed to ensure default admin user:", error);
  }
};

