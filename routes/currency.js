const express = require("express");
const router = express.Router();

const { createCurrency, updateCurrency , deleteCurrency, getCurrency, getAllCurrencies} = require("../controllers/currencyCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/createCurrency", createCurrency);

router.put("/updateCurrency",  updateCurrency);

router.delete("/deleteCurrency",  deleteCurrency);

router.get("/getCurrency/:id",  getCurrency);

router.get("/getAllCurrencies", getAllCurrencies);

module.exports = router;
