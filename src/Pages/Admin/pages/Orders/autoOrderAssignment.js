// autoOrderAssignment.js
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';

class AutoOrderAssignment {
  constructor() {
    this.db = getDatabase();
    this.isRunning = false;
    this.checkInterval = 30000; // Check every 30 seconds
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.processNewOrders();
    
    // Set up continuous monitoring
    this.intervalId = setInterval(() => {
      this.processNewOrders();
    }, this.checkInterval);
    
    // Set up real-time listener for new orders
    const ordersRef = ref(this.db, 'Orders/NewOrders');
    onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        this.processNewOrders();
      }
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isRunning = false;
  }

  async processNewOrders() {
    try {
      // 1. Fetch all unassigned orders
      const ordersRef = ref(this.db, 'Orders/NewOrders');
      const ordersSnapshot = await new Promise((resolve) => {
        onValue(ordersRef, resolve, { onlyOnce: true });
      });

      if (!ordersSnapshot.exists()) return;

      const orders = ordersSnapshot.val();
      const unassignedOrders = Object.entries(orders)
        .filter(([_, order]) => order.status?.toLowerCase() === 'order placed')
        .map(([id, order]) => ({ ...order, orderId: id }));

      if (unassignedOrders.length === 0) return;

      // 2. Process each unassigned order
      for (const order of unassignedOrders) {
        await this.assignOrderToPartner(order);
      }
    } catch (error) {
      console.error('Error processing orders:', error);
    }
  }

  async assignOrderToPartner(order) {
    try {
      // 1. Get available delivery partners
      const partnersRef = ref(this.db, 'Accounts/DeliveryPartner/OnlineDeliveryPartner/WaitingForOrders');
      const partnersSnapshot = await new Promise((resolve) => {
        onValue(partnersRef, resolve, { onlyOnce: true });
      });

      if (!partnersSnapshot.exists()) return false;

      const partners = partnersSnapshot.val();
      const availablePartners = Object.entries(partners);
      
      if (availablePartners.length === 0) return false;

      // 2. Select the first available partner
      const [partnerId, partnerData] = availablePartners[0];

      // 3. Assign order to partner
      const partnerOrderRef = ref(
        this.db,
        `Accounts/DeliveryPartner/${partnerId}/Orders/NewOrders/${order.orderId}`
      );
      await set(partnerOrderRef, order);

      // 4. Move partner to OrderDelivering
      const deliveringRef = ref(
        this.db,
        `Accounts/DeliveryPartner/OnlineDeliveryPartner/OrderDelivering/${partnerId}`
      );
      await set(deliveringRef, partnerData);

      // 5. Remove partner from WaitingForOrders
      const waitingRef = ref(
        this.db,
        `Accounts/DeliveryPartner/OnlineDeliveryPartner/WaitingForOrders/${partnerId}`
      );
      await remove(waitingRef);

      // 6. Update order status
      const orderRef = ref(this.db, `Orders/NewOrders/${order.orderId}`);
      await set(orderRef, {
        ...order,
        status: 'order shared',
        assignedPartnerId: partnerId
      });

      return true;
    } catch (error) {
      console.error('Error assigning order to partner:', error);
      return false;
    }
  }
}

export const autoOrderAssignment = new AutoOrderAssignment();