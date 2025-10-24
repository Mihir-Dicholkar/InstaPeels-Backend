// utils/notificationService.js
import nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// ========== EMAIL CONFIGURATION ==========
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ Verify email connection on startup
emailTransporter.verify((error, success) => {
  if (error) console.log('❌ Email config error:', error);
  else console.log('✅ Email server ready to send messages');
});

// ========== SEND EMAIL ==========
export const sendOrderEmail = async (orderData, isCustomer = false) => {
  try {
    const { orderId, customerName, customerEmail, totalAmount, items, paymentMethod } = orderData;

    if (isCustomer && !customerEmail) {
      console.log('⚠️ Customer email missing, skipping email.');
      return { success: false, error: 'Customer email missing' };
    }

    const itemsList = items.map(item =>
      `- ${item.title} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`
    ).join('\n');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: isCustomer ? customerEmail : process.env.ADMIN_EMAIL,
      subject: isCustomer
        ? `🎉 Your Order ${orderId} is Confirmed`
        : `🔔 New Order Received - ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #F37254; text-align: center;">
              ${isCustomer ? 'Thank You for Your Order!' : 'New Order Placed!'}
            </h2>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333;">Order Details:</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333;">Customer Details:</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              ${!isCustomer ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333;">Items Ordered:</h3>
              <pre style="font-size: 14px; line-height: 1.6;">${itemsList}</pre>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666;">
                ${isCustomer ? 'We will process your order soon!' : 'Check your admin panel for more details!'}
              </p>
            </div>
          </div>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${isCustomer ? customerEmail : process.env.ADMIN_EMAIL}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Email sending failed (${isCustomer ? 'Customer' : 'Admin'}):`, error.message);
    return { success: false, error: error.message };
  }
};

// ========== SEND SMS ==========
export const sendOrderSMS = async (orderData, isCustomer = false) => {
  try {
    const { orderId, customerName, totalAmount, paymentMethod, customerPhone } = orderData;

    const phone = isCustomer ? customerPhone : process.env.ADMIN_PHONE;
    if (!phone) {
      console.log(`⚠️ ${isCustomer ? 'Customer' : 'Admin'} phone missing, skipping SMS.`);
      return { success: false, error: 'Phone number missing' };
    }

    const message = isCustomer
      ? `Hi ${customerName}, your order ${orderId} of ₹${totalAmount} is confirmed. - InstaPeels`
      : `New Order Alert!\nOrder ID: ${orderId}\nCustomer: ${customerName}\nAmount: ₹${totalAmount}\nPayment: ${paymentMethod}\n- InstaPeels`;

    const response = await axios.get('https://api.msg91.com/api/sendhttp.php', {
      params: {
        authkey: process.env.MSG91_AUTH_KEY,
        mobiles: phone,
        message,
        sender: process.env.MSG91_SENDER_ID,
        route: 4,
        country: 91
      }
    });

    console.log(`✅ SMS sent successfully to: ${phone}`);
    return { success: true, response: response.data };
  } catch (error) {
    console.error(`❌ SMS sending failed (${isCustomer ? 'Customer' : 'Admin'}):`, error.message);
    return { success: false, error: error.message };
  }
};

// ========== SEND BOTH NOTIFICATIONS ==========
export const sendOrderNotifications = async (orderData) => {
  console.log('📤 Sending notifications for order:', orderData.orderId);

  try {
    // Admin notifications
    await sendOrderEmail(orderData, false);
    await sendOrderSMS(orderData, false);

    // Customer notifications
    if (orderData.customerEmail || orderData.customerPhone) {
      await sendOrderEmail(orderData, true);
      await sendOrderSMS(orderData, true);
    }

    console.log('✅ All notifications sent successfully');
  } catch (err) {
    console.error('❌ Notification error:', err);
  }
};
