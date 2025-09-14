/**
 * Email Configuration Test Script
 * Run this script to test your SMTP configuration without starting the full server
 * 
 * Usage: node test-email-config.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailConfig() {
  console.log('🔍 Testing Email Configuration...\n');

  // Check environment variables
  console.log('📋 Checking Environment Variables:');
  console.log(`SENDER_EMAIL: ${process.env.SENDER_EMAIL ? '✅ Set' : '❌ Missing'}`);
  console.log(`SENDER_PASSWORD: ${process.env.SENDER_PASSWORD ? '✅ Set' : '❌ Missing'}`);
  console.log(`SMTP_SERVER: ${process.env.SMTP_SERVER || 'smtp.gmail.com (default)'}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT || '587 (default)'}\n`);

  if (!process.env.SENDER_EMAIL || !process.env.SENDER_PASSWORD) {
    console.log('❌ Missing required environment variables!');
    console.log('Please set SENDER_EMAIL and SENDER_PASSWORD in your .env file\n');
    console.log('📖 Setup Guide:');
    console.log('1. Enable 2FA on your Google account');
    console.log('2. Generate App Password at: https://myaccount.google.com/apppasswords');
    console.log('3. Add to .env file:');
    console.log('   SENDER_EMAIL=your-gmail@gmail.com');
    console.log('   SENDER_PASSWORD=your-16-char-app-password');
    return;
  }

  // Test SMTP connection
  console.log('🔌 Testing SMTP Connection...');
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    console.log('🎉 Your email configuration is working correctly!\n');
    
    console.log('📧 You can now use the email feature in your TravelPlanner app.');
    
  } catch (error) {
    console.log('❌ SMTP connection failed:');
    console.log(`Error: ${error.message}\n`);
    
    if (error.code === 'EAUTH') {
      console.log('🔧 Authentication Error - Common Solutions:');
      console.log('1. Make sure 2-factor authentication is enabled on your Google account');
      console.log('2. Use an App Password, not your regular Gmail password');
      console.log('3. Ensure the App Password is exactly 16 characters');
      console.log('4. Make sure SENDER_EMAIL matches the account that generated the App Password');
      console.log('5. Try generating a new App Password');
    } else if (error.code === 'ECONNECTION') {
      console.log('🔧 Connection Error - Check:');
      console.log('1. Your internet connection');
      console.log('2. Firewall settings');
      console.log('3. SMTP server and port settings');
    }
  }
}

// Run the test
testEmailConfig().catch(console.error);
