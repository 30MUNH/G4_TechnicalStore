// async addProducts() {
//     const caseCategory = await Category.findOne({
//       where: { slug: "case" },
//     });
//     if (!caseCategory) {
//       throw new Error("Case category not found");
//     }
//     const cpuCategory = await Category.findOne({
//       where: { slug: "cpu" },
//     });
//     if (!cpuCategory) {
//       throw new Error("CPU category not found");
//     }
//     const gpuCategory = await Category.findOne({
//       where: { slug: "gpu" },
//     });
//     if (!gpuCategory) {
//       throw new Error("GPU category not found");
//     }
//     const motherboardCategory = await Category.findOne({
//       where: { slug: "motherboard" },
//     });
//     if (!motherboardCategory) {
//       throw new Error("Motherboard category not found");
//     }
//     const psuCategory = await Category.findOne({
//       where: { slug: "psu" },
//     });
//     if (!psuCategory) {
//       throw new Error("PSU category not found");
//     }
//     const ramCategory = await Category.findOne({
//       where: { slug: "ram" },
//     });
//     if (!ramCategory) {
//       throw new Error("RAM category not found");
//     }
//     const driveCategory = await Category.findOne({
//       where: { slug: "drive" },
//     });
//     if (!driveCategory) {
//       throw new Error("Drive category not found");
//     }
//     const monitorCategory = await Category.findOne({
//       where: { slug: "monitor" },
//     });
//     if (!monitorCategory) {
//       throw new Error("Monitor category not found");
//     }
//     const mouseCategory = await Category.findOne({
//       where: { slug: "mouse" },
//     });
//     if (!mouseCategory) {
//       throw new Error("Mouse category not found");
//     }
//     const networkCardCategory = await Category.findOne({
//       where: { slug: "network-card" },
//     });
//     if (!networkCardCategory) {
//       throw new Error("Network card category not found");
//     }
//     const headsetCategory = await Category.findOne({
//       where: { slug: "headset" },
//     });
//     if (!headsetCategory) {
//       throw new Error("Headset category not found");
//     }
//     const keyboardCategory = await Category.findOne({
//       where: { slug: "keyboard" },
//     });
//     if (!keyboardCategory) {
//       throw new Error("Keyboard category not found");
//     }

//     // Create products using Active Records
//     const savedProducts = [];

//     // CPU Products
//     const product1: Product = new Product();
//     product1.name = "Intel Core i9-13900K";
//     product1.price = 15990000;
//     product1.description =
//       "Intel Core i9-13900K 24-Core Processor with Intel UHD Graphics 770";
//     product1.stock = 15;
//     product1.category = cpuCategory;
//     await product1.save();
//     savedProducts.push(product1);
//     console.log(`Added product: ${product1.name}`);

//     const product2: Product = new Product();
//     product2.name = "AMD Ryzen 9 7950X";
//     product2.price = 18990000;
//     product2.description =
//       "AMD Ryzen 9 7950X 16-Core Processor with AMD Radeon Graphics";
//     product2.stock = 12;
//     product2.category = cpuCategory;
//     await product2.save();
//     savedProducts.push(product2);
//     console.log(`Added product: ${product2.name}`);

//     const product3: Product = new Product();
//     product3.name = "Intel Core i7-13700K";
//     product3.price = 11990000;
//     product3.description =
//       "Intel Core i7-13700K 16-Core Processor with Intel UHD Graphics 770";
//     product3.stock = 20;
//     product3.category = cpuCategory;
//     await product3.save();
//     savedProducts.push(product3);
//     console.log(`Added product: ${product3.name}`);

//     // GPU Products
//     const product4: Product = new Product();
//     product4.name = "NVIDIA GeForce RTX 4090";
//     product4.price = 45990000;
//     product4.description = "NVIDIA GeForce RTX 4090 24GB GDDR6X Graphics Card";
//     product4.stock = 8;
//     product4.category = gpuCategory;
//     await product4.save();
//     savedProducts.push(product4);
//     console.log(`Added product: ${product4.name}`);

//     const product5: Product = new Product();
//     product5.name = "AMD Radeon RX 7900 XTX";
//     product5.price = 29990000;
//     product5.description = "AMD Radeon RX 7900 XTX 24GB GDDR6 Graphics Card";
//     product5.stock = 10;
//     product5.category = gpuCategory;
//     await product5.save();
//     savedProducts.push(product5);
//     console.log(`Added product: ${product5.name}`);

//     const product6: Product = new Product();
//     product6.name = "NVIDIA GeForce RTX 4080";
//     product6.price = 32990000;
//     product6.description = "NVIDIA GeForce RTX 4080 16GB GDDR6X Graphics Card";
//     product6.stock = 12;
//     product6.category = gpuCategory;
//     await product6.save();
//     savedProducts.push(product6);
//     console.log(`Added product: ${product6.name}`);

//     // RAM Products
//     const product7: Product = new Product();
//     product7.name = "Corsair Vengeance RGB Pro 32GB";
//     product7.price = 2990000;
//     product7.description =
//       "Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4-3600MHz";
//     product7.stock = 25;
//     product7.category = ramCategory;
//     await product7.save();
//     savedProducts.push(product7);
//     console.log(`Added product: ${product7.name}`);

//     const product8: Product = new Product();
//     product8.name = "G.Skill Trident Z5 RGB 32GB";
//     product8.price = 3990000;
//     product8.description = "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000MHz";
//     product8.stock = 20;
//     product8.category = ramCategory;
//     await product8.save();
//     savedProducts.push(product8);
//     console.log(`Added product: ${product8.name}`);

//     const product9: Product = new Product();
//     product9.name = "Kingston Fury Beast 16GB";
//     product9.price = 1590000;
//     product9.description = "Kingston Fury Beast 16GB (2x8GB) DDR4-3200MHz";
//     product9.stock = 30;
//     product9.category = ramCategory;
//     await product9.save();
//     savedProducts.push(product9);
//     console.log(`Added product: ${product9.name}`);

//     // Drive Products
//     const product10: Product = new Product();
//     product10.name = "Samsung 970 EVO Plus 1TB";
//     product10.price = 2990000;
//     product10.description = "Samsung 970 EVO Plus 1TB NVMe M.2 SSD";
//     product10.stock = 22;
//     product10.category = driveCategory;
//     await product10.save();
//     savedProducts.push(product10);
//     console.log(`Added product: ${product10.name}`);

//     const product11: Product = new Product();
//     product11.name = "WD Black SN850X 2TB";
//     product11.price = 5990000;
//     product11.description = "WD Black SN850X 2TB NVMe M.2 SSD";
//     product11.stock = 15;
//     product11.category = driveCategory;
//     await product11.save();
//     savedProducts.push(product11);
//     console.log(`Added product: ${product11.name}`);

//     const product12: Product = new Product();
//     product12.name = "Seagate Barracuda 2TB";
//     product12.price = 1590000;
//     product12.description = "Seagate Barracuda 2TB 7200RPM SATA HDD";
//     product12.stock = 35;
//     product12.category = driveCategory;
//     await product12.save();
//     savedProducts.push(product12);
//     console.log(`Added product: ${product12.name}`);

//     // Motherboard Products
//     const product13: Product = new Product();
//     product13.name = "ASUS ROG Maximus Z790 Hero";
//     product13.price = 8990000;
//     product13.description =
//       "ASUS ROG Maximus Z790 Hero Intel Z790 ATX Motherboard";
//     product13.stock = 12;
//     product13.category = motherboardCategory;
//     await product13.save();
//     savedProducts.push(product13);
//     console.log(`Added product: ${product13.name}`);

//     const product14: Product = new Product();
//     product14.name = "MSI MPG B650 Carbon WiFi";
//     product14.price = 5990000;
//     product14.description = "MSI MPG B650 Carbon WiFi AMD B650 ATX Motherboard";
//     product14.stock = 18;
//     product14.category = motherboardCategory;
//     await product14.save();
//     savedProducts.push(product14);
//     console.log(`Added product: ${product14.name}`);

//     const product15: Product = new Product();
//     product15.name = "Gigabyte B760 Aorus Elite";
//     product15.price = 4990000;
//     product15.description =
//       "Gigabyte B760 Aorus Elite Intel B760 ATX Motherboard";
//     product15.stock = 20;
//     product15.category = motherboardCategory;
//     await product15.save();
//     savedProducts.push(product15);
//     console.log(`Added product: ${product15.name}`);

//     // PSU Products
//     const product16: Product = new Product();
//     product16.name = "Corsair RM850x";
//     product16.price = 3990000;
//     product16.description = "Corsair RM850x 850W 80+ Gold Fully Modular PSU";
//     product16.stock = 16;
//     product16.category = psuCategory;
//     await product16.save();
//     savedProducts.push(product16);
//     console.log(`Added product: ${product16.name}`);

//     const product17: Product = new Product();
//     product17.name = "Seasonic Focus GX-750";
//     product17.price = 2990000;
//     product17.description =
//       "Seasonic Focus GX-750 750W 80+ Gold Fully Modular PSU";
//     product17.stock = 18;
//     product17.category = psuCategory;
//     await product17.save();
//     savedProducts.push(product17);
//     console.log(`Added product: ${product17.name}`);

//     const product18: Product = new Product();
//     product18.name = "EVGA SuperNOVA 1000W";
//     product18.price = 5990000;
//     product18.description =
//       "EVGA SuperNOVA 1000W 80+ Platinum Fully Modular PSU";
//     product18.stock = 10;
//     product18.category = psuCategory;
//     await product18.save();
//     savedProducts.push(product18);
//     console.log(`Added product: ${product18.name}`);

//     // Case Products
//     const product19: Product = new Product();
//     product19.name = "NZXT H510 Elite";
//     product19.price = 3990000;
//     product19.description =
//       "NZXT H510 Elite Mid-Tower ATX Case with Tempered Glass";
//     product19.stock = 14;
//     product19.category = caseCategory;
//     await product19.save();
//     savedProducts.push(product19);
//     console.log(`Added product: ${product19.name}`);

//     const product20: Product = new Product();
//     product20.name = "Lian Li O11 Dynamic";
//     product20.price = 5990000;
//     product20.description = "Lian Li O11 Dynamic Mid-Tower ATX Case";
//     product20.stock = 12;
//     product20.category = caseCategory;
//     await product20.save();
//     savedProducts.push(product20);
//     console.log(`Added product: ${product20.name}`);

//     const product21: Product = new Product();
//     product21.name = "Phanteks Enthoo 719";
//     product21.price = 8990000;
//     product21.description = "Phanteks Enthoo 719 Full-Tower ATX Case";
//     product21.stock = 8;
//     product21.category = caseCategory;
//     await product21.save();
//     savedProducts.push(product21);
//     console.log(`Added product: ${product21.name}`);

//     // Monitor Products
//     const product22: Product = new Product();
//     product22.name = "Samsung Odyssey G9";
//     product22.price = 19990000;
//     product22.description =
//       "Samsung Odyssey G9 49-inch Ultrawide Gaming Monitor";
//     product22.stock = 6;
//     product22.category = monitorCategory;
//     await product22.save();
//     savedProducts.push(product22);
//     console.log(`Added product: ${product22.name}`);

//     const product23: Product = new Product();
//     product23.name = "LG 27GP850-B";
//     product23.price = 8990000;
//     product23.description = "LG 27GP850-B 27-inch 1440p 165Hz Gaming Monitor";
//     product23.stock = 15;
//     product23.category = monitorCategory;
//     await product23.save();
//     savedProducts.push(product23);
//     console.log(`Added product: ${product23.name}`);

//     const product24: Product = new Product();
//     product24.name = "ASUS ROG Swift PG279Q";
//     product24.price = 12990000;
//     product24.description =
//       "ASUS ROG Swift PG279Q 27-inch 1440p 165Hz Gaming Monitor";
//     product24.stock = 10;
//     product24.category = monitorCategory;
//     await product24.save();
//     savedProducts.push(product24);
//     console.log(`Added product: ${product24.name}`);

//     // Mouse Products
//     const product25: Product = new Product();
//     product25.name = "Logitech G Pro X Superlight";
//     product25.price = 2990000;
//     product25.description = "Logitech G Pro X Superlight Wireless Gaming Mouse";
//     product25.stock = 25;
//     product25.category = mouseCategory;
//     await product25.save();
//     savedProducts.push(product25);
//     console.log(`Added product: ${product25.name}`);

//     const product26: Product = new Product();
//     product26.name = "Razer DeathAdder V3 Pro";
//     product26.price = 3990000;
//     product26.description = "Razer DeathAdder V3 Pro Wireless Gaming Mouse";
//     product26.stock = 20;
//     product26.category = mouseCategory;
//     await product26.save();
//     savedProducts.push(product26);
//     console.log(`Added product: ${product26.name}`);

//     const product27: Product = new Product();
//     product27.name = "SteelSeries Rival 600";
//     product27.price = 1990000;
//     product27.description = "SteelSeries Rival 600 Gaming Mouse";
//     product27.stock = 18;
//     product27.category = mouseCategory;
//     await product27.save();
//     savedProducts.push(product27);
//     console.log(`Added product: ${product27.name}`);

//     // Keyboard Products
//     const product28: Product = new Product();
//     product28.name = "Corsair K100 RGB";
//     product28.price = 5990000;
//     product28.description = "Corsair K100 RGB Mechanical Gaming Keyboard";
//     product28.stock = 12;
//     product28.category = keyboardCategory;
//     await product28.save();
//     savedProducts.push(product28);
//     console.log(`Added product: ${product28.name}`);

//     const product29: Product = new Product();
//     product29.name = "Razer BlackWidow V3 Pro";
//     product29.price = 4990000;
//     product29.description =
//       "Razer BlackWidow V3 Pro Wireless Mechanical Keyboard";
//     product29.stock = 15;
//     product29.category = keyboardCategory;
//     await product29.save();
//     savedProducts.push(product29);
//     console.log(`Added product: ${product29.name}`);

//     const product30: Product = new Product();
//     product30.name = "SteelSeries Apex Pro";
//     product30.price = 6990000;
//     product30.description =
//       "SteelSeries Apex Pro TKL Wireless Mechanical Keyboard";
//     product30.stock = 10;
//     product30.category = keyboardCategory;
//     await product30.save();
//     savedProducts.push(product30);
//     console.log(`Added product: ${product30.name}`);

//     // Headset Products
//     const product31: Product = new Product();
//     product31.name = "SteelSeries Arctis Pro Wireless";
//     product31.price = 5990000;
//     product31.description = "SteelSeries Arctis Pro Wireless Gaming Headset";
//     product31.stock = 14;
//     product31.category = headsetCategory;
//     await product31.save();
//     savedProducts.push(product31);
//     console.log(`Added product: ${product31.name}`);

//     const product32: Product = new Product();
//     product32.name = "HyperX Cloud Alpha";
//     product32.price = 2990000;
//     product32.description = "HyperX Cloud Alpha Gaming Headset";
//     product32.stock = 22;
//     product32.category = headsetCategory;
//     await product32.save();
//     savedProducts.push(product32);
//     console.log(`Added product: ${product32.name}`);

//     const product33: Product = new Product();
//     product33.name = "Logitech G Pro X";
//     product33.price = 3990000;
//     product33.description = "Logitech G Pro X Wireless Gaming Headset";
//     product33.stock = 16;
//     product33.category = headsetCategory;
//     await product33.save();
//     savedProducts.push(product33);
//     console.log(`Added product: ${product33.name}`);

//     // Network Card Products
//     const product34: Product = new Product();
//     product34.name = "Intel AX200 WiFi 6";
//     product34.price = 899000;
//     product34.description = "Intel AX200 WiFi 6 Wireless Network Adapter";
//     product34.stock = 30;
//     product34.category = networkCardCategory;
//     await product34.save();
//     savedProducts.push(product34);
//     console.log(`Added product: ${product34.name}`);

//     const product35: Product = new Product();
//     product35.name = "ASUS PCE-AC88";
//     product35.price = 1990000;
//     product35.description = "ASUS PCE-AC88 AC3100 Wireless Network Adapter";
//     product35.stock = 18;
//     product35.category = networkCardCategory;
//     await product35.save();
//     savedProducts.push(product35);
//     console.log(`Added product: ${product35.name}`);

//     const product36: Product = new Product();
//     product36.name = "TP-Link Archer T9E";
//     product36.price = 1590000;
//     product36.description =
//       "TP-Link Archer T9E AC1900 Wireless Network Adapter";
//     product36.stock = 20;
//     product36.category = networkCardCategory;
//     await product36.save();
//     savedProducts.push(product36);
//     console.log(`Added product: ${product36.name}`);

//     // Additional CPU Products
//     const product37: Product = new Product();
//     product37.name = "AMD Ryzen 5 7600X";
//     product37.price = 7990000;
//     product37.description =
//       "AMD Ryzen 5 7600X 6-Core Processor with AMD Radeon Graphics";
//     product37.stock = 25;
//     product37.category = cpuCategory;
//     await product37.save();
//     savedProducts.push(product37);
//     console.log(`Added product: ${product37.name}`);

//     const product38: Product = new Product();
//     product38.name = "Intel Core i5-13600K";
//     product38.price = 8990000;
//     product38.description =
//       "Intel Core i5-13600K 14-Core Processor with Intel UHD Graphics 770";
//     product38.stock = 30;
//     product38.category = cpuCategory;
//     await product38.save();
//     savedProducts.push(product38);
//     console.log(`Added product: ${product38.name}`);

//     const product39: Product = new Product();
//     product39.name = "AMD Ryzen 7 5800X3D";
//     product39.price = 12990000;
//     product39.description =
//       "AMD Ryzen 7 5800X3D 8-Core Processor with 3D V-Cache";
//     product39.stock = 15;
//     product39.category = cpuCategory;
//     await product39.save();
//     savedProducts.push(product39);
//     console.log(`Added product: ${product39.name}`);

//     // Additional GPU Products
//     const product40: Product = new Product();
//     product40.name = "NVIDIA GeForce RTX 4070 Ti";
//     product40.price = 22990000;
//     product40.description =
//       "NVIDIA GeForce RTX 4070 Ti 12GB GDDR6X Graphics Card";
//     product40.stock = 18;
//     product40.category = gpuCategory;
//     await product40.save();
//     savedProducts.push(product40);
//     console.log(`Added product: ${product40.name}`);

//     const product41: Product = new Product();
//     product41.name = "AMD Radeon RX 7700 XT";
//     product41.price = 15990000;
//     product41.description = "AMD Radeon RX 7700 XT 12GB GDDR6 Graphics Card";
//     product41.stock = 22;
//     product41.category = gpuCategory;
//     await product41.save();
//     savedProducts.push(product41);
//     console.log(`Added product: ${product41.name}`);

//     const product42: Product = new Product();
//     product42.name = "NVIDIA GeForce RTX 4060 Ti";
//     product42.price = 15990000;
//     product42.description =
//       "NVIDIA GeForce RTX 4060 Ti 8GB GDDR6 Graphics Card";
//     product42.stock = 25;
//     product42.category = gpuCategory;
//     await product42.save();
//     savedProducts.push(product42);
//     console.log(`Added product: ${product42.name}`);

//     // Additional RAM Products
//     const product43: Product = new Product();
//     product43.name = "Crucial Ballistix MAX 64GB";
//     product43.price = 5990000;
//     product43.description = "Crucial Ballistix MAX 64GB (2x32GB) DDR4-4000MHz";
//     product43.stock = 12;
//     product43.category = ramCategory;
//     await product43.save();
//     savedProducts.push(product43);
//     console.log(`Added product: ${product43.name}`);

//     const product44: Product = new Product();
//     product44.name = "TeamGroup T-Force Delta RGB 32GB";
//     product44.price = 3490000;
//     product44.description =
//       "TeamGroup T-Force Delta RGB 32GB (2x16GB) DDR4-3600MHz";
//     product44.stock = 20;
//     product44.category = ramCategory;
//     await product44.save();
//     savedProducts.push(product44);
//     console.log(`Added product: ${product44.name}`);

//     const product45: Product = new Product();
//     product45.name = "Patriot Viper Steel 16GB";
//     product45.price = 1290000;
//     product45.description = "Patriot Viper Steel 16GB (2x8GB) DDR4-3200MHz";
//     product45.stock = 35;
//     product45.category = ramCategory;
//     await product45.save();
//     savedProducts.push(product45);
//     console.log(`Added product: ${product45.name}`);

//     // Additional Drive Products
//     const product46: Product = new Product();
//     product46.name = "Crucial P5 Plus 1TB";
//     product46.price = 3490000;
//     product46.description = "Crucial P5 Plus 1TB NVMe M.2 SSD";
//     product46.stock = 18;
//     product46.category = driveCategory;
//     await product46.save();
//     savedProducts.push(product46);
//     console.log(`Added product: ${product46.name}`);

//     const product47: Product = new Product();
//     product47.name = "Sabrent Rocket 4 Plus 2TB";
//     product47.price = 6990000;
//     product47.description = "Sabrent Rocket 4 Plus 2TB NVMe M.2 SSD";
//     product47.stock = 12;
//     product47.category = driveCategory;
//     await product47.save();
//     savedProducts.push(product47);
//     console.log(`Added product: ${product47.name}`);

//     const product48: Product = new Product();
//     product48.name = "Western Digital Blue 4TB";
//     product48.price = 2990000;
//     product48.description = "Western Digital Blue 4TB 5400RPM SATA HDD";
//     product48.stock = 25;
//     product48.category = driveCategory;
//     await product48.save();
//     savedProducts.push(product48);
//     console.log(`Added product: ${product48.name}`);

//     // Additional Motherboard Products
//     const product49: Product = new Product();
//     product49.name = "ASRock B650E PG Riptide WiFi";
//     product49.price = 3990000;
//     product49.description =
//       "ASRock B650E PG Riptide WiFi AMD B650E ATX Motherboard";
//     product49.stock = 22;
//     product49.category = motherboardCategory;
//     await product49.save();
//     savedProducts.push(product49);
//     console.log(`Added product: ${product49.name}`);

//     const product50: Product = new Product();
//     product50.name = "MSI PRO Z690-A WiFi";
//     product50.price = 5990000;
//     product50.description = "MSI PRO Z690-A WiFi Intel Z690 ATX Motherboard";
//     product50.stock = 16;
//     product50.category = motherboardCategory;
//     await product50.save();
//     savedProducts.push(product50);
//     console.log(`Added product: ${product50.name}`);

//     const product51: Product = new Product();
//     product51.name = "ASUS TUF Gaming B760M-Plus WiFi";
//     product51.price = 4490000;
//     product51.description =
//       "ASUS TUF Gaming B760M-Plus WiFi Intel B760 mATX Motherboard";
//     product51.stock = 28;
//     product51.category = motherboardCategory;
//     await product51.save();
//     savedProducts.push(product51);
//     console.log(`Added product: ${product51.name}`);

//     // Additional PSU Products
//     const product52: Product = new Product();
//     product52.name = "be quiet! Straight Power 11 850W";
//     product52.price = 4990000;
//     product52.description =
//       "be quiet! Straight Power 11 850W 80+ Gold Fully Modular PSU";
//     product52.stock = 14;
//     product52.category = psuCategory;
//     await product52.save();
//     savedProducts.push(product52);
//     console.log(`Added product: ${product52.name}`);

//     const product53: Product = new Product();
//     product53.name = "Cooler Master V850 Gold V2";
//     product53.price = 3990000;
//     product53.description =
//       "Cooler Master V850 Gold V2 850W 80+ Gold Fully Modular PSU";
//     product53.stock = 18;
//     product53.category = psuCategory;
//     await product53.save();
//     savedProducts.push(product53);
//     console.log(`Added product: ${product53.name}`);

//     const product54: Product = new Product();
//     product54.name = "Thermaltake Toughpower GF1 750W";
//     product54.price = 2990000;
//     product54.description =
//       "Thermaltake Toughpower GF1 750W 80+ Gold Fully Modular PSU";
//     product54.stock = 20;
//     product54.category = psuCategory;
//     await product54.save();
//     savedProducts.push(product54);
//     console.log(`Added product: ${product54.name}`);

//     // Additional Case Products
//     const product55: Product = new Product();
//     product55.name = "Fractal Design Meshify C";
//     product55.price = 2990000;
//     product55.description = "Fractal Design Meshify C Mid-Tower ATX Case";
//     product55.stock = 16;
//     product55.category = caseCategory;
//     await product55.save();
//     savedProducts.push(product55);
//     console.log(`Added product: ${product55.name}`);

//     const product56: Product = new Product();
//     product56.name = "be quiet! Pure Base 500DX";
//     product56.price = 3990000;
//     product56.description = "be quiet! Pure Base 500DX Mid-Tower ATX Case";
//     product56.stock = 12;
//     product56.category = caseCategory;
//     await product56.save();
//     savedProducts.push(product56);
//     console.log(`Added product: ${product56.name}`);

//     const product57: Product = new Product();
//     product57.name = "Corsair 4000D Airflow";
//     product57.price = 3490000;
//     product57.description = "Corsair 4000D Airflow Mid-Tower ATX Case";
//     product57.stock = 18;
//     product57.category = caseCategory;
//     await product57.save();
//     savedProducts.push(product57);
//     console.log(`Added product: ${product57.name}`);

//     // Additional Monitor Products
//     const product58: Product = new Product();
//     product58.name = "AOC CU34G2X";
//     product58.price = 8990000;
//     product58.description = "AOC CU34G2X 34-inch Ultrawide Gaming Monitor";
//     product58.stock = 10;
//     product58.category = monitorCategory;
//     await product58.save();
//     savedProducts.push(product58);
//     console.log(`Added product: ${product58.name}`);

//     const product59: Product = new Product();
//     product59.name = "MSI Optix MAG274QRF";
//     product59.price = 7990000;
//     product59.description =
//       "MSI Optix MAG274QRF 27-inch 1440p 165Hz Gaming Monitor";
//     product59.stock = 12;
//     product59.category = monitorCategory;
//     await product59.save();
//     savedProducts.push(product59);
//     console.log(`Added product: ${product59.name}`);

//     const product60: Product = new Product();
//     product60.name = "ViewSonic XG270QG";
//     product60.price = 9990000;
//     product60.description =
//       "ViewSonic XG270QG 27-inch 1440p 165Hz Gaming Monitor";
//     product60.stock = 8;
//     product60.category = monitorCategory;
//     await product60.save();
//     savedProducts.push(product60);
//     console.log(`Added product: ${product60.name}`);

//     // Additional Mouse Products
//     const product61: Product = new Product();
//     product61.name = "Glorious Model O Wireless";
//     product61.price = 2490000;
//     product61.description = "Glorious Model O Wireless Gaming Mouse";
//     product61.stock = 22;
//     product61.category = mouseCategory;
//     await product61.save();
//     savedProducts.push(product61);
//     console.log(`Added product: ${product61.name}`);

//     const product62: Product = new Product();
//     product62.name = "Pulsar Xlite V2";
//     product62.price = 1990000;
//     product62.description = "Pulsar Xlite V2 Wireless Gaming Mouse";
//     product62.stock = 18;
//     product62.category = mouseCategory;
//     await product62.save();
//     savedProducts.push(product62);
//     console.log(`Added product: ${product62.name}`);

//     const product63: Product = new Product();
//     product63.name = "Endgame Gear XM1r";
//     product63.price = 1790000;
//     product63.description = "Endgame Gear XM1r Gaming Mouse";
//     product63.stock = 15;
//     product63.category = mouseCategory;
//     await product63.save();
//     savedProducts.push(product63);
//     console.log(`Added product: ${product63.name}`);

//     // Additional Keyboard Products
//     const product64: Product = new Product();
//     product64.name = "Ducky One 3 RGB";
//     product64.price = 3990000;
//     product64.description = "Ducky One 3 RGB Mechanical Gaming Keyboard";
//     product64.stock = 16;
//     product64.category = keyboardCategory;
//     await product64.save();
//     savedProducts.push(product64);
//     console.log(`Added product: ${product64.name}`);

//     const product65: Product = new Product();
//     product65.name = "Varmilo VA87M";
//     product65.price = 3490000;
//     product65.description = "Varmilo VA87M Mechanical Gaming Keyboard";
//     product65.stock = 12;
//     product65.category = keyboardCategory;
//     await product65.save();
//     savedProducts.push(product65);
//     console.log(`Added product: ${product65.name}`);

//     const product66: Product = new Product();
//     product66.name = "Leopold FC900R";
//     product66.price = 2990000;
//     product66.description = "Leopold FC900R Mechanical Gaming Keyboard";
//     product66.stock = 14;
//     product66.category = keyboardCategory;
//     await product66.save();
//     savedProducts.push(product66);
//     console.log(`Added product: ${product66.name}`);

//     // Additional Headset Products
//     const product67: Product = new Product();
//     product67.name = "Beyerdynamic DT 990 Pro";
//     product67.price = 3990000;
//     product67.description = "Beyerdynamic DT 990 Pro Gaming Headset";
//     product67.stock = 18;
//     product67.category = headsetCategory;
//     await product67.save();
//     savedProducts.push(product67);
//     console.log(`Added product: ${product67.name}`);

//     const product68: Product = new Product();
//     product68.name = "Audio-Technica ATH-M50x";
//     product68.price = 3490000;
//     product68.description = "Audio-Technica ATH-M50x Gaming Headset";
//     product68.stock = 20;
//     product68.category = headsetCategory;
//     await product68.save();
//     savedProducts.push(product68);
//     console.log(`Added product: ${product68.name}`);

//     const product69: Product = new Product();
//     product69.name = "Sennheiser HD 560S";
//     product69.price = 4490000;
//     product69.description = "Sennheiser HD 560S Gaming Headset";
//     product69.stock = 12;
//     product69.category = headsetCategory;
//     await product69.save();
//     savedProducts.push(product69);
//     console.log(`Added product: ${product69.name}`);

//     // Additional Network Card Products
//     const product70: Product = new Product();
//     product70.name = "ASUS PCE-AX58BT";
//     product70.price = 2490000;
//     product70.description = "ASUS PCE-AX58BT WiFi 6 Wireless Network Adapter";
//     product70.stock = 16;
//     product70.category = networkCardCategory;
//     await product70.save();
//     savedProducts.push(product70);
//     console.log(`Added product: ${product70.name}`);

//     const product71: Product = new Product();
//     product71.name = "Gigabyte GC-WBAX200";
//     product71.price = 1990000;
//     product71.description =
//       "Gigabyte GC-WBAX200 WiFi 6 Wireless Network Adapter";
//     product71.stock = 18;
//     product71.category = networkCardCategory;
//     await product71.save();
//     savedProducts.push(product71);
//     console.log(`Added product: ${product71.name}`);

//     const product72: Product = new Product();
//     product72.name = "MSI AX1800";
//     product72.price = 1790000;
//     product72.description = "MSI AX1800 WiFi 6 Wireless Network Adapter";
//     product72.stock = 14;
//     product72.category = networkCardCategory;
//     await product72.save();
//     savedProducts.push(product72);
//     console.log(`Added product: ${product72.name}`);

//     console.log(`Successfully added ${savedProducts.length} products`);
//     return savedProducts;
//   }

//   async addToComponents() {
//     // Get existing products from database using Active Records
//     const products = await Product.find({
//       where: { isActive: true },
//       relations: ["category"],
//     });

//     const savedComponents = [];

//     // CPU Components
//     const cpuProducts = products.filter((p) => p.category?.slug === "cpu");
//     for (const product of cpuProducts) {
//       if (!product.name) continue;

//       const cpu: CPU = new CPU();
//       cpu.product = product;

//       if (product.name.includes("Intel Core i9-13900K")) {
//         cpu.cores = 24;
//         cpu.threads = 32;
//         cpu.baseClock = "3.0 GHz";
//         cpu.boostClock = "5.8 GHz";
//         cpu.socket = "LGA 1700";
//         cpu.architecture = "Raptor Lake";
//         cpu.tdp = 253;
//         cpu.integratedGraphics = "Intel UHD Graphics 770";
//       } else if (product.name.includes("AMD Ryzen 9 7950X")) {
//         cpu.cores = 16;
//         cpu.threads = 32;
//         cpu.baseClock = "4.5 GHz";
//         cpu.boostClock = "5.7 GHz";
//         cpu.socket = "AM5";
//         cpu.architecture = "Zen 4";
//         cpu.tdp = 170;
//         cpu.integratedGraphics = "AMD Radeon Graphics";
//       } else if (product.name.includes("Intel Core i7-13700K")) {
//         cpu.cores = 16;
//         cpu.threads = 24;
//         cpu.baseClock = "3.4 GHz";
//         cpu.boostClock = "5.4 GHz";
//         cpu.socket = "LGA 1700";
//         cpu.architecture = "Raptor Lake";
//         cpu.tdp = 253;
//         cpu.integratedGraphics = "Intel UHD Graphics 770";
//       } else if (product.name.includes("AMD Ryzen 7 7700X")) {
//         cpu.cores = 8;
//         cpu.threads = 16;
//         cpu.baseClock = "4.5 GHz";
//         cpu.boostClock = "5.4 GHz";
//         cpu.socket = "AM5";
//         cpu.architecture = "Zen 4";
//         cpu.tdp = 105;
//         cpu.integratedGraphics = "AMD Radeon Graphics";
//       } else if (product.name.includes("AMD Ryzen 5 7600X")) {
//         cpu.cores = 6;
//         cpu.threads = 12;
//         cpu.baseClock = "4.7 GHz";
//         cpu.boostClock = "5.3 GHz";
//         cpu.socket = "AM5";
//         cpu.architecture = "Zen 4";
//         cpu.tdp = 105;
//         cpu.integratedGraphics = "AMD Radeon Graphics";
//       } else if (product.name.includes("Intel Core i5-13600K")) {
//         cpu.cores = 14;
//         cpu.threads = 20;
//         cpu.baseClock = "3.5 GHz";
//         cpu.boostClock = "5.1 GHz";
//         cpu.socket = "LGA 1700";
//         cpu.architecture = "Raptor Lake";
//         cpu.tdp = 181;
//         cpu.integratedGraphics = "Intel UHD Graphics 770";
//       } else if (product.name.includes("AMD Ryzen 7 5800X3D")) {
//         cpu.cores = 8;
//         cpu.threads = 16;
//         cpu.baseClock = "3.4 GHz";
//         cpu.boostClock = "4.5 GHz";
//         cpu.socket = "AM4";
//         cpu.architecture = "Zen 3";
//         cpu.tdp = 105;
//         cpu.integratedGraphics = "";
//       }

//       await cpu.save();
//       savedComponents.push(cpu);
//       console.log(`Added CPU component for: ${product.name}`);
//     }

//     // GPU Components
//     const gpuProducts = products.filter((p) => p.category?.slug === "gpu");
//     for (const product of gpuProducts) {
//       if (!product.name) continue;

//       const gpu: GPU = new GPU();
//       gpu.product = product;

//       if (product.name.includes("NVIDIA GeForce RTX 4090")) {
//         gpu.brand = "NVIDIA";
//         gpu.model = "GeForce RTX 4090";
//         gpu.vram = 24;
//         gpu.chipset = "AD102";
//         gpu.memoryType = "GDDR6X";
//         gpu.lengthMm = 304;
//       } else if (product.name.includes("AMD Radeon RX 7900 XTX")) {
//         gpu.brand = "AMD";
//         gpu.model = "Radeon RX 7900 XTX";
//         gpu.vram = 24;
//         gpu.chipset = "Navi 31";
//         gpu.memoryType = "GDDR6";
//         gpu.lengthMm = 287;
//       } else if (product.name.includes("NVIDIA GeForce RTX 4080")) {
//         gpu.brand = "NVIDIA";
//         gpu.model = "GeForce RTX 4080";
//         gpu.vram = 16;
//         gpu.chipset = "AD103";
//         gpu.memoryType = "GDDR6X";
//         gpu.lengthMm = 304;
//       } else if (product.name.includes("AMD Radeon RX 7800 XT")) {
//         gpu.brand = "AMD";
//         gpu.model = "Radeon RX 7800 XT";
//         gpu.vram = 16;
//         gpu.chipset = "Navi 32";
//         gpu.memoryType = "GDDR6";
//         gpu.lengthMm = 267;
//       } else if (product.name.includes("NVIDIA GeForce RTX 4070 Ti")) {
//         gpu.brand = "NVIDIA";
//         gpu.model = "GeForce RTX 4070 Ti";
//         gpu.vram = 12;
//         gpu.chipset = "AD104";
//         gpu.memoryType = "GDDR6X";
//         gpu.lengthMm = 285;
//       } else if (product.name.includes("AMD Radeon RX 7700 XT")) {
//         gpu.brand = "AMD";
//         gpu.model = "Radeon RX 7700 XT";
//         gpu.vram = 12;
//         gpu.chipset = "Navi 32";
//         gpu.memoryType = "GDDR6";
//         gpu.lengthMm = 267;
//       } else if (product.name.includes("NVIDIA GeForce RTX 4060 Ti")) {
//         gpu.brand = "NVIDIA";
//         gpu.model = "GeForce RTX 4060 Ti";
//         gpu.vram = 8;
//         gpu.chipset = "AD106";
//         gpu.memoryType = "GDDR6";
//         gpu.lengthMm = 242;
//       }

//       await gpu.save();
//       savedComponents.push(gpu);
//       console.log(`Added GPU component for: ${product.name}`);
//     }

//     // RAM Components
//     const ramProducts = products.filter((p) => p.category?.slug === "ram");
//     for (const product of ramProducts) {
//       if (!product.name) continue;

//       const ram: RAM = new RAM();
//       ram.product = product;

//       if (product.name.includes("Corsair Vengeance RGB Pro 32GB")) {
//         ram.brand = "Corsair";
//         ram.model = "Vengeance RGB Pro";
//         ram.capacityGb = 32;
//         ram.speedMhz = 3600;
//         ram.type = "DDR4";
//       } else if (product.name.includes("G.Skill Trident Z5 RGB 32GB")) {
//         ram.brand = "G.Skill";
//         ram.model = "Trident Z5 RGB";
//         ram.capacityGb = 32;
//         ram.speedMhz = 6000;
//         ram.type = "DDR5";
//       } else if (product.name.includes("Kingston Fury Beast 16GB")) {
//         ram.brand = "Kingston";
//         ram.model = "Fury Beast";
//         ram.capacityGb = 16;
//         ram.speedMhz = 3200;
//         ram.type = "DDR4";
//       } else if (product.name.includes("Crucial Ballistix MAX 64GB")) {
//         ram.brand = "Crucial";
//         ram.model = "Ballistix MAX";
//         ram.capacityGb = 64;
//         ram.speedMhz = 4000;
//         ram.type = "DDR4";
//       } else if (product.name.includes("TeamGroup T-Force Delta RGB 32GB")) {
//         ram.brand = "TeamGroup";
//         ram.model = "T-Force Delta RGB";
//         ram.capacityGb = 32;
//         ram.speedMhz = 3600;
//         ram.type = "DDR4";
//       } else if (product.name.includes("Patriot Viper Steel 16GB")) {
//         ram.brand = "Patriot";
//         ram.model = "Viper Steel";
//         ram.capacityGb = 16;
//         ram.speedMhz = 3200;
//         ram.type = "DDR4";
//       }

//       await ram.save();
//       savedComponents.push(ram);
//       console.log(`Added RAM component for: ${product.name}`);
//     }

//     // Drive Components
//     const driveProducts = products.filter((p) => p.category?.slug === "drive");
//     for (const product of driveProducts) {
//       if (!product.name) continue;

//       const drive: Drive = new Drive();
//       drive.product = product;

//       if (product.name.includes("Samsung 970 EVO Plus 1TB")) {
//         drive.brand = "Samsung";
//         drive.model = "970 EVO Plus";
//         drive.type = "SSD";
//         drive.capacityGb = 1000;
//         drive.interface = "NVMe M.2";
//       } else if (product.name.includes("WD Black SN850X 2TB")) {
//         drive.brand = "Western Digital";
//         drive.model = "Black SN850X";
//         drive.type = "SSD";
//         drive.capacityGb = 2000;
//         drive.interface = "NVMe M.2";
//       } else if (product.name.includes("Seagate Barracuda 2TB")) {
//         drive.brand = "Seagate";
//         drive.model = "Barracuda";
//         drive.type = "HDD";
//         drive.capacityGb = 2000;
//         drive.interface = "SATA 6Gb/s";
//       } else if (product.name.includes("Crucial P5 Plus 1TB")) {
//         drive.brand = "Crucial";
//         drive.model = "P5 Plus";
//         drive.type = "SSD";
//         drive.capacityGb = 1000;
//         drive.interface = "NVMe M.2";
//       } else if (product.name.includes("Sabrent Rocket 4 Plus 2TB")) {
//         drive.brand = "Sabrent";
//         drive.model = "Rocket 4 Plus";
//         drive.type = "SSD";
//         drive.capacityGb = 2000;
//         drive.interface = "NVMe M.2";
//       } else if (product.name.includes("Western Digital Blue 4TB")) {
//         drive.brand = "Western Digital";
//         drive.model = "Blue";
//         drive.type = "HDD";
//         drive.capacityGb = 4000;
//         drive.interface = "SATA 6Gb/s";
//       }

//       await drive.save();
//       savedComponents.push(drive);
//       console.log(`Added Drive component for: ${product.name}`);
//     }

//     // Motherboard Components
//     const motherboardProducts = products.filter(
//       (p) => p.category?.slug === "motherboard"
//     );
//     for (const product of motherboardProducts) {
//       if (!product.name) continue;

//       const motherboard: Motherboard = new Motherboard();
//       motherboard.product = product;

//       if (product.name.includes("ASUS ROG Maximus Z790 Hero")) {
//         motherboard.brand = "ASUS";
//         motherboard.model = "ROG Maximus Z790 Hero";
//         motherboard.chipset = "Intel Z790";
//         motherboard.socket = "LGA 1700";
//         motherboard.formFactor = "ATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       } else if (product.name.includes("MSI MPG B650 Carbon WiFi")) {
//         motherboard.brand = "MSI";
//         motherboard.model = "MPG B650 Carbon WiFi";
//         motherboard.chipset = "AMD B650";
//         motherboard.socket = "AM5";
//         motherboard.formFactor = "ATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       } else if (product.name.includes("Gigabyte B760 Aorus Elite")) {
//         motherboard.brand = "Gigabyte";
//         motherboard.model = "B760 Aorus Elite";
//         motherboard.chipset = "Intel B760";
//         motherboard.socket = "LGA 1700";
//         motherboard.formFactor = "ATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       } else if (product.name.includes("ASRock B650E PG Riptide WiFi")) {
//         motherboard.brand = "ASRock";
//         motherboard.model = "B650E PG Riptide WiFi";
//         motherboard.chipset = "AMD B650E";
//         motherboard.socket = "AM5";
//         motherboard.formFactor = "ATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       } else if (product.name.includes("MSI PRO Z690-A WiFi")) {
//         motherboard.brand = "MSI";
//         motherboard.model = "PRO Z690-A WiFi";
//         motherboard.chipset = "Intel Z690";
//         motherboard.socket = "LGA 1700";
//         motherboard.formFactor = "ATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       } else if (product.name.includes("ASUS TUF Gaming B760M-Plus WiFi")) {
//         motherboard.brand = "ASUS";
//         motherboard.model = "TUF Gaming B760M-Plus WiFi";
//         motherboard.chipset = "Intel B760";
//         motherboard.socket = "LGA 1700";
//         motherboard.formFactor = "mATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       }

//       await motherboard.save();
//       savedComponents.push(motherboard);
//       console.log(`Added Motherboard component for: ${product.name}`);
//     }

//     // PSU Components
//     const psuProducts = products.filter((p) => p.category?.slug === "psu");
//     for (const product of psuProducts) {
//       if (!product.name) continue;

//       const psu: PSU = new PSU();
//       psu.product = product;

//       if (product.name.includes("Corsair RM850x")) {
//         psu.brand = "Corsair";
//         psu.model = "RM850x";
//         psu.wattage = 850;
//         psu.efficiencyRating = "80+ Gold";
//         psu.modular = "Fully Modular";
//       } else if (product.name.includes("Seasonic Focus GX-750")) {
//         psu.brand = "Seasonic";
//         psu.model = "Focus GX-750";
//         psu.wattage = 750;
//         psu.efficiencyRating = "80+ Gold";
//         psu.modular = "Fully Modular";
//       } else if (product.name.includes("EVGA SuperNOVA 1000W")) {
//         psu.brand = "EVGA";
//         psu.model = "SuperNOVA 1000W";
//         psu.wattage = 1000;
//         psu.efficiencyRating = "80+ Platinum";
//         psu.modular = "Fully Modular";
//       } else if (product.name.includes("be quiet! Straight Power 11 850W")) {
//         psu.brand = "be quiet!";
//         psu.model = "Straight Power 11 850W";
//         psu.wattage = 850;
//         psu.efficiencyRating = "80+ Gold";
//         psu.modular = "Fully Modular";
//       } else if (product.name.includes("Cooler Master V850 Gold V2")) {
//         psu.brand = "Cooler Master";
//         psu.model = "V850 Gold V2";
//         psu.wattage = 850;
//         psu.efficiencyRating = "80+ Gold";
//         psu.modular = "Fully Modular";
//       } else if (product.name.includes("Thermaltake Toughpower GF1 750W")) {
//         psu.brand = "Thermaltake";
//         psu.model = "Toughpower GF1 750W";
//         psu.wattage = 750;
//         psu.efficiencyRating = "80+ Gold";
//         psu.modular = "Fully Modular";
//       }

//       await psu.save();
//       savedComponents.push(psu);
//       console.log(`Added PSU component for: ${product.name}`);
//     }

//     // Case Components
//     const caseProducts = products.filter((p) => p.category?.slug === "case");
//     for (const product of caseProducts) {
//       if (!product.name) continue;

//       const caseComponent: Case = new Case();
//       caseComponent.product = product;

//       if (product.name.includes("NZXT H510 Elite")) {
//         caseComponent.brand = "NZXT";
//         caseComponent.model = "H510 Elite";
//         caseComponent.formFactorSupport = "ATX, mATX, ITX";
//         caseComponent.hasRgb = true;
//         caseComponent.sidePanelType = "Tempered Glass";
//       } else if (product.name.includes("Lian Li O11 Dynamic")) {
//         caseComponent.brand = "Lian Li";
//         caseComponent.model = "O11 Dynamic";
//         caseComponent.formFactorSupport = "ATX, mATX, ITX";
//         caseComponent.hasRgb = false;
//         caseComponent.sidePanelType = "Tempered Glass";
//       } else if (product.name.includes("Phanteks Enthoo 719")) {
//         caseComponent.brand = "Phanteks";
//         caseComponent.model = "Enthoo 719";
//         caseComponent.formFactorSupport = "E-ATX, ATX, mATX, ITX";
//         caseComponent.hasRgb = false;
//         caseComponent.sidePanelType = "Tempered Glass";
//       } else if (product.name.includes("Fractal Design Meshify C")) {
//         caseComponent.brand = "Fractal Design";
//         caseComponent.model = "Meshify C";
//         caseComponent.formFactorSupport = "ATX, mATX, ITX";
//         caseComponent.hasRgb = false;
//         caseComponent.sidePanelType = "Tempered Glass";
//       } else if (product.name.includes("be quiet! Pure Base 500DX")) {
//         caseComponent.brand = "be quiet!";
//         caseComponent.model = "Pure Base 500DX";
//         caseComponent.formFactorSupport = "ATX, mATX, ITX";
//         caseComponent.hasRgb = true;
//         caseComponent.sidePanelType = "Tempered Glass";
//       } else if (product.name.includes("Corsair 4000D Airflow")) {
//         caseComponent.brand = "Corsair";
//         caseComponent.model = "4000D Airflow";
//         caseComponent.formFactorSupport = "ATX, mATX, ITX";
//         caseComponent.hasRgb = false;
//         caseComponent.sidePanelType = "Tempered Glass";
//       }

//       await caseComponent.save();
//       savedComponents.push(caseComponent);
//       console.log(`Added Case component for: ${product.name}`);
//     }

//     // Monitor Components
//     const monitorProducts = products.filter(
//       (p) => p.category?.slug === "monitor"
//     );
//     for (const product of monitorProducts) {
//       if (!product.name) continue;

//       const monitor: Monitor = new Monitor();
//       monitor.product = product;

//       if (product.name.includes("Samsung Odyssey G9")) {
//         monitor.brand = "Samsung";
//         monitor.model = "Odyssey G9";
//         monitor.sizeInch = 49.0;
//         monitor.resolution = "5120x1440";
//         monitor.refreshRate = 240;
//         monitor.panelType = "VA";
//       } else if (product.name.includes("LG 27GP850-B")) {
//         monitor.brand = "LG";
//         monitor.model = "27GP850-B";
//         monitor.sizeInch = 27.0;
//         monitor.resolution = "2560x1440";
//         monitor.refreshRate = 165;
//         monitor.panelType = "IPS";
//       } else if (product.name.includes("ASUS ROG Swift PG279Q")) {
//         monitor.brand = "ASUS";
//         monitor.model = "ROG Swift PG279Q";
//         monitor.sizeInch = 27.0;
//         monitor.resolution = "2560x1440";
//         monitor.refreshRate = 165;
//         monitor.panelType = "IPS";
//       } else if (product.name.includes("AOC CU34G2X")) {
//         monitor.brand = "AOC";
//         monitor.model = "CU34G2X";
//         monitor.sizeInch = 34.0;
//         monitor.resolution = "3440x1440";
//         monitor.refreshRate = 144;
//         monitor.panelType = "VA";
//       } else if (product.name.includes("MSI Optix MAG274QRF")) {
//         monitor.brand = "MSI";
//         monitor.model = "Optix MAG274QRF";
//         monitor.sizeInch = 27.0;
//         monitor.resolution = "2560x1440";
//         monitor.refreshRate = 165;
//         monitor.panelType = "IPS";
//       } else if (product.name.includes("ViewSonic XG270QG")) {
//         monitor.brand = "ViewSonic";
//         monitor.model = "XG270QG";
//         monitor.sizeInch = 27.0;
//         monitor.resolution = "2560x1440";
//         monitor.refreshRate = 165;
//         monitor.panelType = "IPS";
//       }

//       await monitor.save();
//       savedComponents.push(monitor);
//       console.log(`Added Monitor component for: ${product.name}`);
//     }

//     // Mouse Components
//     const mouseProducts = products.filter((p) => p.category?.slug === "mouse");
//     for (const product of mouseProducts) {
//       if (!product.name) continue;

//       const mouse: Mouse = new Mouse();
//       mouse.product = product;

//       if (product.name.includes("Logitech G Pro X Superlight")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 25600;
//         mouse.connectivity = "Wireless";
//         mouse.hasRgb = false;
//       } else if (product.name.includes("Razer DeathAdder V3 Pro")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 30000;
//         mouse.connectivity = "Wireless";
//         mouse.hasRgb = true;
//       } else if (product.name.includes("SteelSeries Rival 600")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 12000;
//         mouse.connectivity = "Wired";
//         mouse.hasRgb = true;
//       } else if (product.name.includes("Glorious Model O Wireless")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 19000;
//         mouse.connectivity = "Wireless";
//         mouse.hasRgb = true;
//       } else if (product.name.includes("Pulsar Xlite V2")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 19000;
//         mouse.connectivity = "Wireless";
//         mouse.hasRgb = false;
//       } else if (product.name.includes("Endgame Gear XM1r")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 19000;
//         mouse.connectivity = "Wired";
//         mouse.hasRgb = false;
//       }

//       await mouse.save();
//       savedComponents.push(mouse);
//       console.log(`Added Mouse component for: ${product.name}`);
//     }

//     // Keyboard Components
//     const keyboardProducts = products.filter(
//       (p) => p.category?.slug === "keyboard"
//     );
//     for (const product of keyboardProducts) {
//       if (!product.name) continue;

//       const keyboard: Keyboard = new Keyboard();
//       keyboard.product = product;

//       if (product.name.includes("Corsair K100 RGB")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "Optical-Mechanical";
//         keyboard.connectivity = "Wired";
//         keyboard.layout = "Full-size";
//         keyboard.hasRgb = true;
//       } else if (product.name.includes("Razer BlackWidow V3 Pro")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "Razer Yellow";
//         keyboard.connectivity = "Wireless";
//         keyboard.layout = "Full-size";
//         keyboard.hasRgb = true;
//       } else if (product.name.includes("SteelSeries Apex Pro")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "OmniPoint";
//         keyboard.connectivity = "Wireless";
//         keyboard.layout = "TKL";
//         keyboard.hasRgb = true;
//       } else if (product.name.includes("Ducky One 3 RGB")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "Cherry MX";
//         keyboard.connectivity = "Wired";
//         keyboard.layout = "Full-size";
//         keyboard.hasRgb = true;
//       } else if (product.name.includes("Varmilo VA87M")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "Cherry MX";
//         keyboard.connectivity = "Wired";
//         keyboard.layout = "TKL";
//         keyboard.hasRgb = false;
//       } else if (product.name.includes("Leopold FC900R")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "Cherry MX";
//         keyboard.connectivity = "Wired";
//         keyboard.layout = "Full-size";
//         keyboard.hasRgb = false;
//       }

//       await keyboard.save();
//       savedComponents.push(keyboard);
//       console.log(`Added Keyboard component for: ${product.name}`);
//     }

//     // Headset Components
//     const headsetProducts = products.filter(
//       (p) => p.category?.slug === "headset"
//     );
//     for (const product of headsetProducts) {
//       if (!product.name) continue;

//       const headset: Headset = new Headset();
//       headset.product = product;

//       if (product.name.includes("SteelSeries Arctis Pro Wireless")) {
//         headset.hasMicrophone = true;
//         headset.connectivity = "Wireless";
//         headset.surroundSound = true;
//       } else if (product.name.includes("HyperX Cloud Alpha")) {
//         headset.hasMicrophone = true;
//         headset.connectivity = "Wired";
//         headset.surroundSound = false;
//       } else if (product.name.includes("Logitech G Pro X")) {
//         headset.hasMicrophone = true;
//         headset.connectivity = "Wireless";
//         headset.surroundSound = true;
//       } else if (product.name.includes("Beyerdynamic DT 990 Pro")) {
//         headset.hasMicrophone = false;
//         headset.connectivity = "Wired";
//         headset.surroundSound = false;
//       } else if (product.name.includes("Audio-Technica ATH-M50x")) {
//         headset.hasMicrophone = false;
//         headset.connectivity = "Wired";
//         headset.surroundSound = false;
//       } else if (product.name.includes("Sennheiser HD 560S")) {
//         headset.hasMicrophone = false;
//         headset.connectivity = "Wired";
//         headset.surroundSound = false;
//       }

//       await headset.save();
//       savedComponents.push(headset);
//       console.log(`Added Headset component for: ${product.name}`);
//     }

//     // Network Card Components
//     const networkCardProducts = products.filter(
//       (p) => p.category?.slug === "network-card"
//     );
//     for (const product of networkCardProducts) {
//       if (!product.name) continue;

//       const networkCard: NetworkCard = new NetworkCard();
//       networkCard.product = product;

//       if (product.name.includes("Intel AX200 WiFi 6")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "M.2";
//         networkCard.speedMbps = 2400;
//       } else if (product.name.includes("ASUS PCE-AC88")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "PCIe";
//         networkCard.speedMbps = 2100;
//       } else if (product.name.includes("TP-Link Archer T9E")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "PCIe";
//         networkCard.speedMbps = 1900;
//       } else if (product.name.includes("ASUS PCE-AX58BT")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "PCIe";
//         networkCard.speedMbps = 2400;
//       } else if (product.name.includes("Gigabyte GC-WBAX200")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "M.2";
//         networkCard.speedMbps = 2400;
//       } else if (product.name.includes("MSI AX1800")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "PCIe";
//         networkCard.speedMbps = 1800;
//       }

//       await networkCard.save();
//       savedComponents.push(networkCard);
//       console.log(`Added Network Card component for: ${product.name}`);
//     }

//     console.log(
//       `Successfully added ${savedComponents.length} component records`
//     );
//     return savedComponents;
//   }