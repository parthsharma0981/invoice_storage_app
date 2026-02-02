// Plan limits configuration
const PLAN_LIMITS = {
    starter: {
        maxUsers: 1,
        maxInvoicesPerMonth: 50,
        maxCustomers: 50,
        maxProducts: 50,
        inventory: false,
        advancedInsights: false,
    },
    pro: {
        maxUsers: 3,
        maxInvoicesPerMonth: -1, // -1 means unlimited
        maxCustomers: -1,
        maxProducts: -1,
        inventory: true,
        advancedInsights: true,
    },
    enterprise: {
        maxUsers: -1,
        maxInvoicesPerMonth: -1,
        maxCustomers: -1,
        maxProducts: -1,
        inventory: true,
        advancedInsights: true,
    },
};

// Plan pricing
const PLAN_PRICING = {
    starter: { monthly: 299, yearly: 2999 },
    pro: { monthly: 499, yearly: 4999 },
    enterprise: { monthly: 999, yearly: 9999 },
};

function getPlanLimits(plan) {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
}

function getPlanPrice(plan, billingCycle = "monthly") {
    const prices = PLAN_PRICING[plan] || PLAN_PRICING.starter;
    return prices[billingCycle] || prices.monthly;
}

function canAddUser(plan, currentUserCount) {
    const limits = getPlanLimits(plan);
    if (limits.maxUsers === -1) return true;
    return currentUserCount < limits.maxUsers;
}

function canCreateInvoice(plan, currentMonthlyCount) {
    const limits = getPlanLimits(plan);
    if (limits.maxInvoicesPerMonth === -1) return true;
    return currentMonthlyCount < limits.maxInvoicesPerMonth;
}

function canAddCustomer(plan, currentCount) {
    const limits = getPlanLimits(plan);
    if (limits.maxCustomers === -1) return true;
    return currentCount < limits.maxCustomers;
}

function canAddProduct(plan, currentCount) {
    const limits = getPlanLimits(plan);
    if (limits.maxProducts === -1) return true;
    return currentCount < limits.maxProducts;
}

function hasInventoryAccess(plan) {
    return getPlanLimits(plan).inventory;
}

function hasAdvancedInsights(plan) {
    return getPlanLimits(plan).advancedInsights;
}

module.exports = {
    PLAN_LIMITS,
    PLAN_PRICING,
    getPlanLimits,
    getPlanPrice,
    canAddUser,
    canCreateInvoice,
    canAddCustomer,
    canAddProduct,
    hasInventoryAccess,
    hasAdvancedInsights,
};
