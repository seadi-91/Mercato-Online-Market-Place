"use client";

import React from "react";
import { SupplierSidebar } from "./supplier-sidebar";
import { SupplierHeader } from "./supplier-header";
import { SupplierNotificationsDrawer } from "../notifications/supplier-notifications-drawer";
import { SupplierOrderActionModal } from "../orders/supplier-order-action-modal";
import { SupplierCreateQuoteModal } from "../quotations/supplier-create-quote-modal";
import {
  SupplierAdjustStockModal,
  SupplierTransferStockModal,
} from "../inventory/supplier-stock-modals";
import { SupplierCounterOfferModal } from "../negotiations/supplier-counter-offer-modal";
import { SupplierHelpModal } from "../shared/supplier-help-modal";
import { SupplierMobileBottomNav } from "./supplier-mobile-bottom-nav";
import {
  SupplierPaymentSuccessModal,
  SourcingPaymentSuccessData,
} from "../sourcing/supplier-payment-success-modal";

// Views
import { SupplierDashboardView } from "../dashboard/supplier-dashboard-view";
import { SupplierProductsView } from "../products/supplier-products-view";
import { SupplierCreateProductView } from "../products/supplier-create-product-view";
import { SupplierInventoryView } from "../inventory/supplier-inventory-view";
import { SupplierPricingView } from "../pricing/supplier-pricing-view";
import { SupplierSourcingView } from "../sourcing/supplier-sourcing-view";
import { SupplierMyOrdersView } from "../sourcing/supplier-my-orders-view";
import { SupplierRFQView } from "../rfq/supplier-rfq-view";
import { SupplierQuotationsView } from "../quotations/supplier-quotations-view";
import { SupplierNegotiationsView } from "../negotiations/supplier-negotiations-view";
import { SupplierOrdersView } from "../orders/supplier-orders-view";
import { SupplierCustomersView } from "../customers/supplier-customers-view";
import { SupplierWarehouseView } from "../warehouse/supplier-warehouse-view";
import { SupplierShipmentsView } from "../shipments/supplier-shipments-view";
import { SupplierInvoicesView } from "../invoices/supplier-invoices-view";
import { SupplierPaymentsView } from "../payments/supplier-payments-view";
import { SupplierPromotionsView } from "../promotions/supplier-promotions-view";
import { SupplierDisputesView } from "../disputes/supplier-disputes-view";
import { SupplierMessagesView } from "../messages/supplier-messages-view";
import { SupplierAnalyticsView } from "../analytics/supplier-analytics-view";
import { SupplierProfileView } from "../profile/supplier-profile-view";
import { SupplierSettingsView } from "../settings/supplier-settings-view";
import { SupplierVerificationView } from "../verification/supplier-verification-view";
import { SupplierRegistrationView } from "../registration/supplier-registration-view";
import { SupplierNotificationsView } from "../notifications/supplier-notifications-view";
import { SupplierTeamView } from "../team/supplier-team-view";

import { useSupplierStore } from "@/store/supplier-store";
import { SupplierTab } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierLayoutShell({ initialTab }: { initialTab?: SupplierTab } = {}) {
  const {
    activeTab,
    setActiveTab,
    subView,
    fetchWarehouses,
    fetchStaff,
    hydrateStore,
    fetchProfile,
    createSourcingOrder,
    paySourcingOrder,
    fetchSourcingOrders,
  } = useSupplierStore();

  const [paymentSuccessModalData, setPaymentSuccessModalData] =
    React.useState<SourcingPaymentSuccessData | null>(null);

  React.useEffect(() => {
    hydrateStore();
    fetchProfile();
    fetchWarehouses();
    fetchStaff();
    fetchSourcingOrders();
  }, [hydrateStore, fetchProfile, fetchWarehouses, fetchStaff, fetchSourcingOrders]);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }

    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlTab = searchParams.get("tab") as SupplierTab | null;
      const paymentStatus = searchParams.get("payment_status") || searchParams.get("status");

      if (urlTab) {
        setActiveTab(urlTab);
      }

      if (paymentStatus === "success") {
        const txRef = searchParams.get("tx_ref") || `CHAPA-TXN-${Date.now()}`;
        try {
          const pendingRaw = localStorage.getItem("mercatox_pending_sourcing_order");
          if (pendingRaw) {
            const pendingOrder = JSON.parse(pendingRaw);
            const createdOrder = createSourcingOrder(pendingOrder);
            paySourcingOrder(createdOrder.id, "chapa", txRef);
            localStorage.removeItem("mercatox_pending_sourcing_order");
            
            setPaymentSuccessModalData({
              orderNumber: createdOrder.orderNumber,
              transactionNumber: txRef,
              totalAmount: createdOrder.totalETB,
              productName: createdOrder.productName,
              productImage: createdOrder.productImage,
              quantity: createdOrder.quantity,
              unit: createdOrder.unit,
              unitPrice: createdOrder.unitPrice,
              paymentMethod: "chapa",
              handoverOtp: createdOrder.handoverOtp,
              destinationWarehouseName: createdOrder.destinationWarehouseName,
              deliveryAddress: createdOrder.deliveryAddress,
              trackingNumber: createdOrder.trackingNumber,
              supplierName: createdOrder.supplierName,
              deliveryEstimateDays: createdOrder.deliveryEstimateDays,
            });

            toast.success("Chapa Payment Successful!", {
              description: `Purchase Order #${createdOrder.orderNumber} is confirmed and ETB funds are secured in Escrow.`,
              duration: 7000,
            });
          } else {
            const tempOrderNum = `PO-ETH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            setPaymentSuccessModalData({
              orderNumber: tempOrderNum,
              transactionNumber: txRef,
              totalAmount: 184500,
              productName: "Verified Sourcing Purchase",
              quantity: 10,
              unit: "Unit",
              paymentMethod: "chapa",
              handoverOtp: "8492",
              destinationWarehouseName: "Addis Ababa Central Logistics Hub",
            });

            toast.success("Chapa Payment Successful!", {
              description: "Your B2B Escrow funds are secured and purchase order has been placed.",
              duration: 6000,
            });
          }
        } catch (e) {
          console.error("Error finalizing pending sourcing order:", e);
        }

        // Clean up query parameters without page reload
        const newUrl = window.location.pathname + "?tab=my-orders";
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [initialTab, setActiveTab, createSourcingOrder, paySourcingOrder]);

  const renderActiveView = () => {
    if (subView === "create-product") {
      return <SupplierCreateProductView />;
    }
    if (subView === "verification" || activeTab === "verification") {
      return <SupplierVerificationView />;
    }
    if (subView === "onboarding" || activeTab === "onboarding") {
      return <SupplierRegistrationView />;
    }

    switch (activeTab) {
      case "dashboard":
        return <SupplierDashboardView />;
      case "products":
        return <SupplierProductsView />;
      case "inventory":
        return <SupplierInventoryView />;
      case "pricing":
        return <SupplierPricingView />;
      case "sourcing":
        return <SupplierSourcingView />;
      case "my-orders":
        return <SupplierMyOrdersView />;
      case "rfqs":
        return <SupplierRFQView />;
      case "quotations":
        return <SupplierQuotationsView />;
      case "negotiations":
        return <SupplierNegotiationsView />;
      case "orders":
        return <SupplierOrdersView />;
      case "customers":
        return <SupplierCustomersView />;
      case "warehouse":
        return <SupplierWarehouseView />;
      case "shipments":
        return <SupplierShipmentsView />;
      case "invoices":
        return <SupplierInvoicesView />;
      case "payments":
        return <SupplierPaymentsView />;
      case "promotions":
        return <SupplierPromotionsView />;
      case "disputes":
        return <SupplierDisputesView />;
      case "messages":
        return <SupplierMessagesView />;
      case "analytics":
        return <SupplierAnalyticsView />;
      case "profile":
        return <SupplierProfileView />;
      case "settings":
        return <SupplierSettingsView />;
      case "notifications":
        return <SupplierNotificationsView />;
      case "team":
        return <SupplierTeamView />;
      default:
        return <SupplierDashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full app-layout-canvas bg-[#070a10] text-zinc-100 font-sans selection:bg-indigo-600/30 selection:text-indigo-600 dark:text-indigo-400 overflow-hidden antialiased supplier-workspace">
      {/* Persistent Left Supplier Sidebar */}
      <SupplierSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Sticky Top Supplier Header */}
        <SupplierHeader />

        {/* Scrollable Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6 pb-20 lg:pb-8">
          <div className="w-full max-w-[1440px] mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Mobile & Tablet Bottom Navigation Bar */}
      <SupplierMobileBottomNav />

      {/* Slide-out Notification Center Drawer */}
      <SupplierNotificationsDrawer />

      {/* Global Interactive Workflow Modals */}
      <SupplierOrderActionModal />
      <SupplierCreateQuoteModal />
      <SupplierAdjustStockModal />
      <SupplierTransferStockModal />
      <SupplierCounterOfferModal />
      <SupplierHelpModal />

      {/* Payment Success Dialog with Transaction Number, Order Number & OK to My Orders */}
      <SupplierPaymentSuccessModal
        isOpen={!!paymentSuccessModalData}
        data={paymentSuccessModalData}
        onClose={() => setPaymentSuccessModalData(null)}
        onOk={() => {
          setPaymentSuccessModalData(null);
          setActiveTab("my-orders");
        }}
      />
    </div>
  );
}
