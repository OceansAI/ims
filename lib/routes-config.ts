export const page_routes = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: "layout-dashboard"
      }
    ]
  },
  {
    title: "Inventory Management",
    items: [
      {
        title: "Products",
        icon: "package",
        items: [
          {
            title: "All Products",
            href: "/products",
            icon: "list"
          },
          {
            title: "Add Product",
            href: "/products/new",
            icon: "plus"
          }
        ]
      },
      {
        title: "Inventory",
        icon: "box-seam",
        items: [
          {
            title: "Current Stock",
            href: "/inventory",
            icon: "boxes"
          },
          {
            title: "Movements",
            href: "/inventory/movements",
            icon: "move"
          },
          {
            title: "Audits",
            href: "/inventory/audits",
            icon: "clipboard-check"
          }
        ]
      }
    ]
  },
  {
    title: "Reports & Analytics",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: "bar-chart"
      },
      {
        title: "Storage Rates",
        href: "/reports/storage-rates",
        icon: "dollar-sign"
      }
    ]
  },
  {
    title: "Settings",
    items: [
      {
        title: "General Settings",
        href: "/settings",
        icon: "settings"
      },
      {
        title: "Customer Management",
        href: "/settings/customers",
        icon: "users"
      }
    ]
  }
];