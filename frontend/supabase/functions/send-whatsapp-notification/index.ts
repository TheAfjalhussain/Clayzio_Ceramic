import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WHATSAPP_BUSINESS_URL = "https://wa.me/message/EQYT3ZKFLXNGA1";

interface OrderData {
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  paymentMethod: string;
  address: string;
}

interface NewsletterData {
  email: string;
}

interface NotificationRequest {
  type: 'order' | 'newsletter' | 'product_view' | 'payment_page' | 'contact';
  data: OrderData | NewsletterData | any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: NotificationRequest = await req.json();
    
    let message = "";
    
    switch (type) {
      case 'order':
        const orderData = data as OrderData;
        const itemsList = orderData.items.map(i => `• ${i.name} x${i.qty} - ₹${i.price * i.qty}`).join('\n');
        message = `🛒 *New Order Received!*

📦 *Order ID:* #${orderData.orderId.slice(0, 8)}

👤 *Customer:* ${orderData.customerName}
📞 *Phone:* ${orderData.phone}
📧 *Email:* ${orderData.email}

🛍️ *Items:*
${itemsList}

💰 *Total:* ₹${orderData.total}
💳 *Payment:* ${orderData.paymentMethod.toUpperCase()}

📍 *Address:*
${orderData.address}

---
View in admin dashboard`;
        break;

      case 'newsletter':
        const newsletterData = data as NewsletterData;
        message = `📧 *New Newsletter Subscription!*

Email: ${newsletterData.email}

A new customer has joined the Clay Club!`;
        break;

      case 'product_view':
        message = `👁️ *Product Viewed*

Product: ${data.productName}
Category: ${data.category || 'N/A'}`;
        break;

      case 'payment_page':
        message = `💳 *Payment Page Visit*

Customer initiated checkout
Cart Value: ₹${data.cartValue}
Items: ${data.itemCount}`;
        break;

      case 'contact':
        message = `📬 *New Contact Form Submission!*

👤 *Name:* ${data.name}
📧 *Email:* ${data.email}
📞 *Phone:* ${data.phone || 'Not provided'}
📋 *Subject:* ${data.subject || 'General'}

💬 *Message:*
${data.message}

---
Reply to connect with this customer!`;
        break;

      default:
        message = `📢 *Notification*\n\n${JSON.stringify(data, null, 2)}`;
    }

    // Log the notification (in production, you'd send to WhatsApp Business API)
    console.log("WhatsApp Notification:", message);
    console.log("WhatsApp Business URL:", WHATSAPP_BUSINESS_URL);
    
    // Store notification in database for reference
    // In production, you would integrate with WhatsApp Business API here
    // For now, we log it and return success
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification logged successfully",
        whatsappUrl: WHATSAPP_BUSINESS_URL
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-whatsapp-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
