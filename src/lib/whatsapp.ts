export const WHATSAPP_NUMBERS = ["+213658592303", "+213658160260"];

export const sendWhatsAppOrder = (
  dishName: string,
  restaurantName: string,
  price: number,
  customerName?: string
) => {
  const message = `🍽️ *طلب جديد من 3omda Delivre*\n\n📋 الطبق: ${dishName}\n🏪 المطعم: ${restaurantName}\n💰 السعر: ${price} DA${
    customerName ? `\n👤 الاسم: ${customerName}` : ""
  }\n\nأرجو التواصل معي لتأكيد الطلب`;

  // Try first number, if user doesn't have WhatsApp, they can try second
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBERS[0].replace(
    /\+/g,
    ""
  )}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, "_blank");
};