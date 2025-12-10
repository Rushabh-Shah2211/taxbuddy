// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create a new Order
// @route   POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
    try {
        const options = {
            amount: 4900, // Amount in paise (4900 paise = ₹49)
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7),
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
});

// @desc    Verify Payment Signature
// @route   POST /api/payment/verify
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment Success! Here you would typically mark the user as "Paid" in DB
            res.json({ message: "Payment Verified Successfully", success: true });
        } else {
            res.status(400).json({ message: "Invalid Signature", success: false });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;