import express from "express";
import { getCompaniesById,getCompany, registerCompany, updateCompany } from "../controllers/company.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();
router.route("/registerCompany").post(isAuthenticated,registerCompany);
router.route("/get").get(isAuthenticated,getCompany);
router.route("/get/:id").get(isAuthenticated,getCompaniesById);
router.route("/update/:id").put(isAuthenticated,updateCompany);

export default router;