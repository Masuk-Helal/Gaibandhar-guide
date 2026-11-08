export interface MenuItem {
  name: string;
  price: string; // BDT price
  category: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const RESTAURANT_MENU: MenuSection[] = [
  {
    title: "Steaks",
    items: [
      { name: "Beef Steak", price: "৳1,450", category: "Steak" },
      { name: "Chicken Steak", price: "৳950", category: "Steak" },
      { name: "Tuna Steak", price: "৳1,050", category: "Steak" },
      { name: "Salmon Fillet", price: "৳1,050", category: "Steak" },
      { name: "Ribeye", price: "৳1,250", category: "Steak" },
    ],
  },
  {
    title: "More Steaks",
    items: [
      { name: "Porterhouse Steak", price: "৳1,450", category: "Steak" },
      { name: "T-Bone Steak", price: "৳1,250", category: "Steak" },
      { name: "New York Strip", price: "৳1,050", category: "Steak" },
      { name: "Pasta", price: "৳650", category: "Pasta" },
      { name: "Spaghetti", price: "৳650", category: "Pasta" },
    ],
  },
  {
    title: "Beverages",
    items: [
      { name: "Mineral Water", price: "৳60", category: "Drink" },
      { name: "Orange Juice", price: "৳180", category: "Drink" },
      { name: "Milkshake", price: "৳220", category: "Drink" },
      { name: "Ice Tea", price: "৳140", category: "Drink" },
      { name: "Hot Tea", price: "৳80", category: "Drink" },
    ],
  },
  {
    title: "Chocolates & Juices",
    items: [
      { name: "Ice Chocolate", price: "৳180", category: "Drink" },
      { name: "Hot Chocolate", price: "৳180", category: "Drink" },
      { name: "Juice", price: "৳140", category: "Drink" },
      { name: "Cocktail", price: "৳250", category: "Drink" },
      { name: "Ice Milk", price: "৳140", category: "Drink" },
    ],
  },
];

export function getRestaurantMenu(): MenuSection[] {
  return RESTAURANT_MENU;
}
