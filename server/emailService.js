const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = null;
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Only initialize if SMTP credentials are provided
      if (process.env.SENDER_EMAIL && process.env.SENDER_PASSWORD) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_SERVER || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASSWORD,
          },
        });

        // Note: We'll verify the connection when actually sending emails
        // to avoid blocking server startup with authentication issues
        console.log('SMTP transporter initialized. Connection will be verified when sending emails.');
      } else {
        console.warn('SMTP credentials not provided. Email functionality will be disabled.');
        console.log('To enable email functionality, set SENDER_EMAIL and SENDER_PASSWORD environment variables.');
      }
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async generateProfessionalEmailContent(itineraryData, userEmail) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const emailPrompt = `
      Create a professional and warm email content for a personalized travel itinerary delivery. Use the following information:
      
      ITINERARY DATA:
      ${JSON.stringify(itineraryData, null, 2)}
      
      Format the email with:
      1. Warm greeting from TravelAI
      2. Brief introduction about the personalized itinerary
      3. Detailed day-by-day breakdown with:
         - Day title and overview
         - Activity schedule with times
         - Location details and descriptions
         - Cost estimates
         - Tips and recommendations
      4. Summary section with:
         - Total estimated cost
         - Trip highlights
         - Important travel tips
      5. Professional closing with invitation to reach out for modifications
      
      Make it personal, professional, and actionable. Use a warm but professional tone.
      Do NOT use markdown formatting - use plain text with clear sections and proper line breaks.
      Keep it well-structured and easy to read.
      `;

      const result = await model.generateContent(emailPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating email content:', error);
      // Fallback to basic email content
      return this.generateBasicEmailContent(itineraryData);
    }
  }

  generateBasicEmailContent(itineraryData) {
    let emailContent = `Dear Traveler,

Thank you for using TravelAI! We've generated your personalized travel itinerary.

ITINERARY DETAILS:
==================

`;

    // Add day-by-day breakdown
    itineraryData.itinerary.forEach((day) => {
      emailContent += `${day.date} - ${day.title}\n`;
      emailContent += ''.padEnd(50, '-') + '\n';
      
      day.activities.forEach((activity) => {
        emailContent += `${activity.time} - ${activity.activity}\n`;
        emailContent += `Location: ${activity.location}\n`;
        emailContent += `Description: ${activity.description}\n`;
        emailContent += `Cost: ${activity.cost}\n\n`;
      });
      
      emailContent += '\n';
    });

    // Add summary
    if (itineraryData.summary) {
      emailContent += `TRIP SUMMARY:
==================
Total Estimated Cost: ${itineraryData.summary.totalCost}

Highlights:
`;
      itineraryData.summary.highlights.forEach((highlight) => {
        emailContent += `• ${highlight}\n`;
      });

      emailContent += `\nTravel Tips:
`;
      itineraryData.summary.tips.forEach((tip) => {
        emailContent += `• ${tip}\n`;
      });
    }

    emailContent += `\n\nHappy Travels!
The TravelAI Team

---
Need modifications? Simply reply to this email with your preferences.`;

    return emailContent;
  }

  async sendItineraryEmail(emailAddress, itineraryData, userDetails = {}) {
    try {
      // Validate email address
      if (!this.validateEmail(emailAddress)) {
        throw new Error('Please provide a valid email address.');
      }

      // Check if we have itinerary data
      if (!itineraryData || !itineraryData.itinerary) {
        throw new Error('No itinerary data available to send.');
      }

      // Check SMTP configuration
      if (!process.env.SENDER_EMAIL || !process.env.SENDER_PASSWORD || !this.transporter) {
        throw new Error('Email configuration is missing. Please set SENDER_EMAIL and SENDER_PASSWORD environment variables in your .env file.');
      }

      // Generate professional email content
      const emailBody = await this.generateProfessionalEmailContent(itineraryData, emailAddress);

      // Create email options
      const mailOptions = {
        from: `TravelAI <${process.env.SENDER_EMAIL}>`,
        to: emailAddress,
        subject: `Your Personalized Travel Itinerary - ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`,
        text: emailBody,
        html: this.convertToHTML(emailBody)
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', info.messageId);
      return {
        success: true,
        message: `Perfect! I've sent your detailed personalized travel itinerary to ${emailAddress}. Please check your inbox. The email includes specific activities, timings, cost estimates, and travel tips. Let me know if you need any modifications!`,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('Failed to send email:', error);
      
      let userMessage = `I apologize, but I encountered an error while sending the email: ${error.message}`;
      
      // Provide specific guidance for common Gmail errors
      if (error.code === 'EAUTH' || error.message.includes('Username and Password not accepted')) {
        userMessage = `Gmail authentication failed. Please check your email setup:
        
1. Make sure you're using a Gmail address for SENDER_EMAIL
2. Enable 2-factor authentication on your Google account
3. Generate an App Password at: https://myaccount.google.com/apppasswords
4. Use the App Password (not your regular password) for SENDER_PASSWORD
5. Make sure your .env file has the correct credentials

Current error: Invalid Gmail credentials. Please verify your SENDER_EMAIL and SENDER_PASSWORD in the .env file.`;
      } else if (error.code === 'ECONNECTION') {
        userMessage = 'Unable to connect to Gmail servers. Please check your internet connection and try again.';
      }
      
      return {
        success: false,
        message: userMessage
      };
    }
  }

  convertToHTML(textContent) {
    // Convert plain text to basic HTML formatting
    return textContent
      .replace(/\n/g, '<br>')
      .replace(/([A-Z][A-Z\s]+:)/g, '<strong>$1</strong>')
      .replace(/^(.*) - (.*)$/gm, '<h3>$1 - $2</h3>')
      .replace(/^• (.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  }
}

module.exports = EmailService;
