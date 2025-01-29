const assignOrderToDeliveryPartner = async (order) => {
    try {
      // 1. Check for available delivery partners
      const partnersResponse = await fetch(
        'https://facialrecognitiondb-default-rtdb.firebaseio.com/Accounts/DeliveryPartner/OnlineDeliveryPartner/WaitingForOrders.json'
      );
      
      if (!partnersResponse.ok) {
        throw new Error('No delivery partners available');
      }
      
      const partners = await partnersResponse.json();
      if (!partners || Object.keys(partners).length === 0) {
        return false;
      }
  
      // 2. Get the first available partner
      const firstPartnerId = Object.keys(partners)[0];
      const selectedPartner = partners[firstPartnerId];
  
      // 3. Assign order to the selected partner using orderId as key
      await fetch(
        `https://facialrecognitiondb-default-rtdb.firebaseio.com/Accounts/DeliveryPartner/${firstPartnerId}/Orders/NewOrders/${order.orderId}.json`,
        {
          method: 'PUT', // Using PUT to set specific key
          body: JSON.stringify(order)
        }
      );
  
      // 4. Move partner to OrderDelivering using phone number as key
      await fetch(
        `https://facialrecognitiondb-default-rtdb.firebaseio.com/Accounts/DeliveryPartner/OnlineDeliveryPartner/OrderDelivering/${firstPartnerId}.json`,
        {
          method: 'PUT', // Using PUT to set specific key
          body: JSON.stringify(selectedPartner)
        }
      );
  
      // 5. Delete partner from WaitingForOrders
      await fetch(
        `https://facialrecognitiondb-default-rtdb.firebaseio.com/Accounts/DeliveryPartner/OnlineDeliveryPartner/WaitingForOrders/${firstPartnerId}.json`,
        {
          method: 'DELETE'
        }
      );
  
      return true;
    } catch (error) {
      console.error('Error assigning delivery partner:', error);
      return false;
    }
  };
  
  export default assignOrderToDeliveryPartner;