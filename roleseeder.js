import mongoose from "mongoose";
import roleModel from "./models/role.model.js";
import dotenv from "dotenv";
dotenv.config();

const seedRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await roleModel.create([
      { name: "admin", permissions: ["CREATE", "READ", "UPDATE", "DELETE"] },
      { name: "employee", permissions: ["READ", "UPDATE"] },
    ]);
    console.log("Roles seeded successfully");
  } catch (err) {
    console.log(err.message);
  } finally {
    await mongoose.disconnect();
  }
};
seedRoles();