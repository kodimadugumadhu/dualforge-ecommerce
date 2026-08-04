package com.enterprise.ecommerce.config;

import com.enterprise.ecommerce.model.*;
import com.enterprise.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed & Guarantee Core System Accounts (Admin, Seller, Customer)
        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            admin = new User("admin", "admin@dualforge.com", passwordEncoder.encode("adminpassword"), Role.ROLE_ADMIN, "Super", "Admin", "9999999999");
            admin.setEmailVerified(true);
            admin.setMobileVerified(true);
            admin.setEnabled(true);
            admin.setAccountStatus(AccountStatus.ACTIVE);
            userRepository.save(admin);
        } else {
            // Ensure admin is unlocked and active
            admin.setAccountStatus(AccountStatus.ACTIVE);
            admin.setFailedLoginAttempts(0);
            admin.setLockoutExpiry(null);
            admin.setEnabled(true);
            admin.setEmailVerified(true);
            admin.setMobileVerified(true);
            admin.setPassword(passwordEncoder.encode("adminpassword"));
            userRepository.save(admin);
        }

        User seller = userRepository.findByUsername("seller").orElse(null);
        if (seller == null) {
            seller = new User("seller", "seller@dualforge.com", passwordEncoder.encode("sellerpassword"), Role.ROLE_SELLER, "Premium", "Seller", "8888888888");
            seller.setEmailVerified(true);
            seller.setMobileVerified(true);
            seller.setEnabled(true);
            seller.setAccountStatus(AccountStatus.ACTIVE);
            seller = userRepository.save(seller);
            cartRepository.save(new Cart(seller));
            wishlistRepository.save(new Wishlist(seller));
        }

        // Guarantee approved seller profile exists for seed seller
        if (seller != null && sellerRepository.findByUser(seller).isEmpty()) {
            Seller sellerProfile = new Seller(seller, "DualForge Verified Store", "27AAAAA0000A1Z5", "HDFC Bank Ltd - HDFC0001234", "100 Tech Park, Bengaluru, Karnataka");
            sellerProfile.setApprovalStatus("APPROVED");
            sellerProfile.setStoreVerified(true);
            sellerRepository.save(sellerProfile);
        }

        User customer = userRepository.findByUsername("customer").orElse(null);
        if (customer == null) {
            customer = new User("customer", "customer@gmail.com", passwordEncoder.encode("customerpassword"), Role.ROLE_CUSTOMER, "John", "Doe", "7777777777");
            customer.setEmailVerified(true);
            customer.setMobileVerified(true);
            customer.setEnabled(true);
            customer.setAccountStatus(AccountStatus.ACTIVE);
            customer = userRepository.save(customer);
            cartRepository.save(new Cart(customer));
            wishlistRepository.save(new Wishlist(customer));
        }

        // Fetch seller for linking products
        seller = userRepository.findByUsername("seller").orElse(null);

        // 2. Seed & Retrieve Categories
        Category electronics = categoryRepository.findAll().stream()
                .filter(c -> "Electronics".equalsIgnoreCase(c.getName()))
                .findFirst()
                .orElseGet(() -> categoryRepository.save(new Category("Electronics", "Premium gadget systems and devices")));

        Category footwear = categoryRepository.findAll().stream()
                .filter(c -> "Footwear".equalsIgnoreCase(c.getName()))
                .findFirst()
                .orElseGet(() -> categoryRepository.save(new Category("Footwear", "Elite trainers and casual shoes")));

        Category apparel = categoryRepository.findAll().stream()
                .filter(c -> "Fashion".equalsIgnoreCase(c.getName()))
                .findFirst()
                .orElseGet(() -> categoryRepository.save(new Category("Fashion", "Trending apparel and style wear")));

        // 3. Seed 50+ Products if count < 50
        if (productRepository.count() < 50 && seller != null) {
            seed50PlusProducts(electronics, footwear, apparel, seller);
        }

        // 4. Seed Coupons
        if (couponRepository.count() == 0) {
            couponRepository.save(new Coupon("WELCOME10", 10.0, LocalDateTime.now().plusMonths(6), true));
            couponRepository.save(new Coupon("FORGE25", 25.0, LocalDateTime.now().plusMonths(6), true));
            couponRepository.save(new Coupon("FLAGSHIP20", 20.0, LocalDateTime.now().plusMonths(6), true));
        }
    }

    private void seed50PlusProducts(Category elec, Category foot, Category app, User seller) {
        Product[] prods = new Product[] {
            // Hoodies & Apparel
            new Product("Tech Hoodie Black", "Wind-resistant thermo-regulating fleece hoodie with travel pockets.", 2499.0, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100", app, seller, 40, 5, "SKU-HD-001", "10001", "ForgeWear", "Hoodies", "apparel,hoodie,black,sweatshirt", 0.6, "40x30x5 cm", 5.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 10.0, 4.8, 85, "Size: S, M, L, XL | Color: Black, Gray", "Fabric: Fleece Blend"),
            new Product("Cyberpunk Oversized Hoodie", "Heavyweight 450GSM organic cotton oversized fleece hoodie.", 3299.0, "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500", "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=100", app, seller, 25, 4, "SKU-HD-002", "10002", "CyberForge", "Hoodies", "apparel,hoodie,cyberpunk,oversized", 0.8, "42x32x6 cm", 5.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 15.0, 4.9, 120, "Size: M, L, XL, XXL | Color: Neon Green, Stealth Gray", "Fabric: 100% Organic Cotton"),
            new Product("Minimalist Zip Fleece Hoodie", "Full-zip thermal insulator hoodie for gym and outdoor travel.", 1999.0, "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500", "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=100", app, seller, 60, 5, "SKU-HD-003", "10003", "ForgeWear", "Hoodies", "apparel,hoodie,zip,fleece", 0.5, "38x28x4 cm", 5.0, "6 Months Warranty", "7 Days Return", 0.0, 3, 5.0, 4.5, 64, "Size: S, M, L | Color: Navy, Olive Green", "Fabric: Micro-Fleece"),
            new Product("Urban Bomber Jacket", "Weatherproof bomber jacket with padded thermal lining.", 4499.0, "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500", "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=100", app, seller, 30, 4, "SKU-JK-004", "10004", "ForgeWear", "Jackets", "apparel,jacket,bomber,urban", 1.1, "45x35x8 cm", 5.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 20.0, 4.7, 98, "Size: M, L, XL | Color: Army Green, Black", "Shell: Nylon, Fill: Polyester"),
            new Product("Denim Trucker Jacket", "Vintage washed rugged denim jacket with sherpa collar.", 3799.0, "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500", "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100", app, seller, 18, 3, "SKU-JK-005", "10005", "DenimForge", "Jackets", "apparel,jacket,denim,trucker", 1.3, "45x35x7 cm", 5.0, "1 Year Warranty", "7 Days Return", 99.0, 4, 10.0, 4.6, 52, "Size: S, M, L, XL | Color: Washed Blue, Vintage Black", "100% Cotton Denim"),
            new Product("Slim Fit Tapered Jeans", "Stretch denim jeans designed for everyday ergonomic comfort.", 2299.0, "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100", app, seller, 50, 5, "SKU-JN-006", "10006", "DenimForge", "Jeans", "apparel,jeans,denim,slim", 0.7, "35x25x4 cm", 5.0, "6 Months Warranty", "7 Days Return", 0.0, 3, 15.0, 4.4, 76, "Size: 30, 32, 34, 36 | Color: Dark Blue, Black", "98% Cotton, 2% Elastane"),
            new Product("Graphic Oversized Tee", "Breathable combed cotton streetwear graphic t-shirt.", 1199.0, "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100", app, seller, 80, 10, "SKU-TS-007", "10007", "ForgeWear", "T-Shirts", "apparel,tshirt,tee,graphic", 0.3, "30x20x2 cm", 5.0, "No Warranty", "7 Days Return", 0.0, 2, 10.0, 4.6, 140, "Size: S, M, L, XL | Color: White, Black, Purple", "100% Combed Cotton"),
            new Product("Polo Performance Shirt", "Moisture-wicking breathable polo shirt for casual & sports.", 1499.0, "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500", "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=100", app, seller, 45, 5, "SKU-PL-008", "10008", "ForgeWear", "Polo Shirts", "apparel,polo,shirt,performance", 0.3, "30x20x2 cm", 5.0, "No Warranty", "7 Days Return", 0.0, 3, 5.0, 4.5, 48, "Size: M, L, XL | Color: Royal Blue, White, Charcoal", "Poly-Pique Blend"),

            // Headphones & Audio
            new Product("Forgebuds ANC", "Studio acoustics, active noise cancellation, and 40h battery cell.", 4999.0, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100", elec, seller, 50, 5, "SKU-AU-009", "10009", "ForgeAudio", "Headphones", "headphone,audio,anc,buds", 0.3, "6x6x3 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 10.0, 4.6, 188, "Color: Black, White", "ANC: 35dB, Battery: 40h"),
            new Product("ForgePro Wireless Gaming Headset", "Low-latency 2.4GHz wireless headset with detachable spatial mic.", 6499.0, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100", elec, seller, 35, 4, "SKU-AU-010", "10010", "ForgeAudio", "Headphones", "headphone,gaming,wireless,headset", 0.5, "20x18x9 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 15.0, 4.8, 142, "Color: Cyber Red, Matte Black", "Drivers: 50mm Neodymium, Battery: 30h"),
            new Product("AcousticBass Studio Headphones", "Professional monitor headphones with 50mm drivers for sound engineers.", 7999.0, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100", elec, seller, 20, 3, "SKU-AU-011", "10011", "AcousticForge", "Headphones", "headphone,studio,monitor,audio", 0.6, "22x20x10 cm", 18.0, "2 Year Warranty", "7 Days Return", 0.0, 3, 20.0, 4.9, 95, "Color: Gold Accent, Black", "Impedance: 32 Ohm, Frequency: 10Hz-30kHz"),
            new Product("PocketPods Mini TWS", "Ultra-compact true wireless earbuds with magnetic fast charging case.", 1999.0, "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=500", "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=100", elec, seller, 70, 8, "SKU-AU-012", "10012", "ForgeAudio", "Earbuds", "headphone,earphone,tws,buds", 0.2, "5x5x2 cm", 18.0, "6 Months Warranty", "7 Days Return", 0.0, 2, 25.0, 4.4, 210, "Color: Arctic White, Cyan", "Battery: 24h Total"),
            new Product("BoomBlast Portable Speaker", "IPX7 waterproof 30W Bluetooth speaker with deep bass radiator.", 3499.0, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100", elec, seller, 40, 5, "SKU-AU-013", "10013", "ForgeAudio", "Speakers", "speaker,audio,bluetooth,waterproof", 0.9, "18x8x8 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 10.0, 4.7, 115, "Color: Army Camo, Black", "Power: 30W RMS, Battery: 15h"),
            new Product("SoundBar Surround 120W", "Cinema-grade 2.1 channel soundbar with wireless subwoofer.", 9999.0, "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=100", elec, seller, 15, 2, "SKU-AU-014", "10014", "ForgeAudio", "Soundbars", "soundbar,speaker,home theater", 4.2, "90x10x10 cm", 18.0, "1 Year Warranty", "7 Days Return", 199.0, 4, 15.0, 4.8, 73, "Color: Piano Black", "Channels: 2.1 Dolby Digital"),

            // Footwear & Shoes
            new Product("Stealth Runners", "Hydrophobic mesh structure with ultra-rebound cushioning outsoles.", 3499.0, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100", foot, seller, 30, 5, "SKU-FT-015", "10015", "Stealth", "Running Shoes", "shoe,sneaker,runner,footwear", 0.8, "30x20x10 cm", 18.0, "3 Months Warranty", "30 Days Return", 149.0, 2, 20.0, 4.7, 254, "Size: 7, 8, 9, 10, 11 | Color: Red, Blue, Black", "Mesh Upper, Rubber Sole"),
            new Product("Apex Velocity Sneakers", "Lightweight carbon-plated marathon racing shoes.", 5999.0, "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500", "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=100", foot, seller, 20, 3, "SKU-FT-016", "10016", "ApexForge", "Running Shoes", "shoe,sneaker,velocity,running", 0.7, "30x20x10 cm", 18.0, "6 Months Warranty", "30 Days Return", 0.0, 3, 15.0, 4.9, 165, "Size: 8, 9, 10, 11 | Color: Volt Yellow, White", "Carbon Plate, Nitrogen Foam"),
            new Product("Classic Leather Oxfords", "Handcrafted Italian genuine leather formal Oxford dress shoes.", 4999.0, "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500", "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=100", foot, seller, 25, 4, "SKU-FT-017", "10017", "LeatherForge", "Formal Shoes", "shoe,formal,oxford,leather", 1.1, "32x22x12 cm", 18.0, "6 Months Warranty", "30 Days Return", 0.0, 3, 10.0, 4.6, 82, "Size: 7, 8, 9, 10 | Color: Tan Brown, Onyx Black", "100% Genuine Full-Grain Leather"),
            new Product("Urban High-Top Sneakers", "Retro basketball style high-top sneakers with ankle support.", 3999.0, "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500", "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=100", foot, seller, 35, 5, "SKU-FT-018", "10018", "StreetForge", "Casual Shoes", "shoe,sneaker,hightop,streetwear", 1.0, "32x22x12 cm", 18.0, "3 Months Warranty", "30 Days Return", 0.0, 3, 15.0, 4.8, 190, "Size: 7, 8, 9, 10, 11 | Color: White/Red, Black/Gold", "Leather & Suede"),
            new Product("TrailBlazer Hiking Boots", "Waterproof Vibram sole rugged outdoor trekking boots.", 6999.0, "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500", "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=100", foot, seller, 15, 2, "SKU-FT-019", "10019", "TrailForge", "Trekking Boots", "shoe,boot,hiking,outdoor", 1.4, "34x24x14 cm", 18.0, "1 Year Warranty", "30 Days Return", 0.0, 4, 10.0, 4.9, 110, "Size: 8, 9, 10, 11 | Color: Earth Brown, Charcoal", "Vibram Rubber, Waterproof Membrane"),
            new Product("Breathable Slip-On Loafers", "Ultra-light memory foam casual slip-on driving loafers.", 2499.0, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500", "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=100", foot, seller, 50, 5, "SKU-FT-020", "10020", "CasualForge", "Loafers", "shoe,loafer,slipon,casual", 0.6, "30x20x10 cm", 18.0, "3 Months Warranty", "30 Days Return", 0.0, 3, 20.0, 4.5, 78, "Size: 7, 8, 9, 10 | Color: Navy, Gray, Beige", "Canvas & Memory Foam"),

            // Laptops & Electronics
            new Product("Forgebook Pro 16", "Liquid-metal cooled workstation laptop with 16-inch 120Hz display.", 124999.0, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100", elec, seller, 15, 3, "SKU-LP-021", "10021", "Forge", "Laptops", "laptop,computer,forgebook,pc", 2.1, "35x24x2 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 15.0, 4.8, 124, "RAM: 16GB, 32GB | Storage: 1TB SSD", "Intel i9 13900H, RTX 4070"),
            new Product("Forgebook Ultra 14", "Slim 1.2kg magnesium alloy ultrabook with 2.8K OLED touch screen.", 84999.0, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100", elec, seller, 22, 4, "SKU-LP-022", "10022", "Forge", "Laptops", "laptop,ultrabook,oled,forgebook", 1.2, "31x21x1.4 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 10.0, 4.9, 156, "RAM: 16GB | Storage: 512GB SSD", "Intel EVO i7, OLED Display"),
            new Product("ForgeRig Desktop Gaming PC", "Liquid cooled Intel i7 + RTX 4080 16GB gaming tower.", 174999.0, "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500", "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100", elec, seller, 8, 2, "SKU-PC-023", "10023", "ForgeGaming", "Desktops", "computer,pc,desktop,gaming", 12.5, "45x22x48 cm", 18.0, "2 Year Warranty", "7 Days Return", 499.0, 5, 12.0, 4.9, 42, "RAM: 32GB DDR5 | Storage: 2TB NVMe", "RTX 4080 16GB, 850W PSU"),
            new Product("Curved Gaming Monitor 34\"", "Ultrawide 144Hz 1ms WQHD curved HDR gaming monitor.", 34999.0, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100", elec, seller, 18, 3, "SKU-MN-024", "10024", "ForgeVision", "Monitors", "monitor,display,gaming,curved", 6.8, "81x45x20 cm", 18.0, "3 Year Warranty", "7 Days Return", 0.0, 3, 15.0, 4.7, 89, "Resolution: 3440x1440 | Refresh: 144Hz", "1500R Curve, FreeSync Premium"),
            new Product("RGB Mechanical Keyboard", "Hot-swappable tactile mechanical switches with per-key RGB.", 3499.0, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100", elec, seller, 60, 5, "SKU-KB-025", "10025", "ForgeKey", "Keyboards", "keyboard,mechanical,rgb,gaming", 0.9, "36x14x4 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 20.0, 4.6, 230, "Switches: Red Linear, Brown Tactile", "PBT Keycaps, Type-C Detachable"),
            new Product("Ergonomic Wireless Gaming Mouse", "26,000 DPI optical sensor with 70h battery and sub-60g shell.", 2999.0, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100", elec, seller, 75, 10, "SKU-MS-026", "10026", "ForgeMouse", "Mice", "mouse,gaming,wireless,ergonomic", 0.1, "12x6x4 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 15.0, 4.8, 310, "Color: Matte Black, White", "DPI: 26K, Weight: 58g"),

            // Smartwatches & Wearables
            new Product("Forge Watch Ultra", "Titanium case outdoor smartwatch with dual-frequency GPS & ECG.", 14999.0, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100", elec, seller, 25, 4, "SKU-SW-027", "10027", "ForgeWatch", "Smartwatches", "watch,smartwatch,wearable,ultra", 0.15, "49x44x14 mm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 10.0, 4.9, 148, "Color: Titanium Gray, Black Strap", "Display: 2.0\" AMOLED, Battery: 7 Days"),
            new Product("Quantum Fit Band 5", "AMOLED fitness tracker with SpO2, continuous heart rate, and 14-day battery.", 2499.0, "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500", "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=100", elec, seller, 90, 10, "SKU-SW-028", "10028", "Quantum", "Fitness Bands", "watch,band,fitness,smartwatch", 0.04, "45x18x11 mm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 20.0, 4.5, 290, "Color: Black, Blue, Pink", "Display: 1.47\" AMOLED"),

            // Accessories & Lifestyle
            new Product("Carbon Fiber Travel Backpack", "Anti-theft TSA compliant waterproof 30L laptop travel bag.", 2999.0, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100", app, seller, 40, 5, "SKU-AC-029", "10029", "TravelForge", "Backpacks", "backpack,bag,travel,laptop", 0.9, "48x32x18 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 15.0, 4.8, 175, "Color: Carbon Black, Steel Gray", "Capacity: 30L, USB Charging Port"),
            new Product("MagSafe 3-in-1 Fast Wireless Charger", "15W magnetic charging station for iPhone, Watch & Airpods.", 2499.0, "https://images.unsplash.com/photo-1622445268465-843846586617?w=500", "https://images.unsplash.com/photo-1622445268465-843846586617?w=100", elec, seller, 65, 8, "SKU-AC-030", "10030", "ForgePower", "Chargers", "charger,wireless,magsafe,power", 0.3, "12x10x8 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 10.0, 4.7, 132, "Color: Matte Black, Pearl White", "Power: 15W Fast Charge"),

            // Additional 22 Products for 50+ total catalog size
            new Product("Heavyweight Sherpa Zip Hoodie", "Ultra-warm sherpa lined winter fleece hoodie.", 3999.0, "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500", "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=100", app, seller, 30, 4, "SKU-HD-031", "10031", "ForgeWear", "Hoodies", "apparel,hoodie,sherpa,winter", 0.9, "42x32x7 cm", 5.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 15.0, 4.8, 92, "Size: S, M, L, XL | Color: Cream, Charcoal", "Fabric: Sherpa Fleece"),
            new Product("Athletic Performance Pullover Hoodie", "Moisture-wicking 4-way stretch gym training hoodie.", 2199.0, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100", app, seller, 55, 6, "SKU-HD-032", "10032", "ForgeWear", "Hoodies", "apparel,hoodie,gym,performance", 0.5, "38x28x4 cm", 5.0, "6 Months Warranty", "7 Days Return", 0.0, 2, 10.0, 4.6, 114, "Size: M, L, XL | Color: Stealth Black, Electric Blue", "Spandex-Poly Blend"),
            new Product("Vintage Washed Crewneck Sweater", "Pre-washed retro oversized crewneck fleece sweater.", 2799.0, "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500", "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=100", app, seller, 35, 5, "SKU-SW-033", "10033", "ForgeWear", "Sweaters", "apparel,sweater,crewneck,vintage", 0.6, "40x30x4 cm", 5.0, "6 Months Warranty", "7 Days Return", 0.0, 3, 12.0, 4.7, 78, "Size: S, M, L, XL | Color: Vintage Moss, Dust Rose", "100% Cotton"),
            new Product("Windbreaker Running Jacket", "Ultra-lightweight packable rain-proof windbreaker.", 2999.0, "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500", "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=100", app, seller, 40, 5, "SKU-JK-034", "10034", "ForgeWear", "Jackets", "apparel,jacket,windbreaker,raincoat", 0.4, "35x25x3 cm", 5.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 20.0, 4.5, 65, "Size: M, L, XL | Color: Cyber Yellow, Black", "Ripstop Nylon"),
            new Product("Retro Canvas Court Sneakers", "Classic vulcanized rubber sole canvas skate sneakers.", 2199.0, "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=100", foot, seller, 50, 6, "SKU-FT-035", "10035", "StreetForge", "Casual Shoes", "shoe,sneaker,canvas,skate", 0.7, "30x20x10 cm", 18.0, "3 Months Warranty", "30 Days Return", 0.0, 3, 15.0, 4.6, 145, "Size: 7, 8, 9, 10, 11 | Color: Off-White, Black", "Canvas & Rubber"),
            new Product("All-Terrain Trail Sneakers", "Gore-Tex waterproof heavy lug trail running shoes.", 5499.0, "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500", "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=100", foot, seller, 25, 4, "SKU-FT-036", "10036", "TrailForge", "Running Shoes", "shoe,sneaker,trail,outdoor", 0.9, "32x22x12 cm", 18.0, "6 Months Warranty", "30 Days Return", 0.0, 3, 10.0, 4.9, 88, "Size: 8, 9, 10, 11 | Color: Olive Drab, Orange Accent", "Gore-Tex Upper, Contagrip Sole"),
            new Product("Suede Penny Loafers", "Italian handcrafted soft suede casual driving loafers.", 3999.0, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500", "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=100", foot, seller, 28, 4, "SKU-FT-037", "10037", "LeatherForge", "Loafers", "shoe,loafer,suede,formal", 0.8, "30x20x10 cm", 18.0, "6 Months Warranty", "30 Days Return", 0.0, 3, 15.0, 4.7, 56, "Size: 7, 8, 9, 10 | Color: Chocolate Brown, Navy", "Genuine Suede Leather"),
            new Product("Tactical Combat Boots", "Side-zip military grade tactical assault boots.", 5999.0, "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500", "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=100", foot, seller, 18, 3, "SKU-FT-038", "10038", "TacForge", "Boots", "shoe,boot,tactical,combat", 1.5, "35x25x15 cm", 18.0, "1 Year Warranty", "30 Days Return", 0.0, 4, 10.0, 4.8, 94, "Size: 8, 9, 10, 11 | Color: Coyote Tan, Black", "Full Grain Leather & Cordura"),
            new Product("Noise Isolating Earbuds Wired", "3.5mm gold-plated jack in-ear earphones with mic.", 799.0, "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=500", "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=100", elec, seller, 100, 15, "SKU-AU-039", "10039", "ForgeAudio", "Earphones", "headphone,earphone,wired,audio", 0.1, "10x5x2 cm", 18.0, "6 Months Warranty", "7 Days Return", 0.0, 2, 20.0, 4.3, 310, "Color: Black, Silver", "Driver: 10mm Dynamic"),
            new Product("Desktop Hi-Fi Studio Monitors", "Active 50W bookshelf speakers with optical & Bluetooth inputs.", 11999.0, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100", elec, seller, 15, 2, "SKU-AU-040", "10040", "AcousticForge", "Speakers", "speaker,audio,studio,hifi", 5.5, "30x20x18 cm", 18.0, "2 Year Warranty", "7 Days Return", 0.0, 4, 10.0, 4.9, 45, "Color: Walnut Wood, Black", "Power: 50W RMS, Silk Dome Tweeter"),
            new Product("20,000mAh 65W Power Bank", "Laptop-compatible fast charging power bank with digital display.", 3499.0, "https://images.unsplash.com/photo-1622445268465-843846586617?w=500", "https://images.unsplash.com/photo-1622445268465-843846586617?w=100", elec, seller, 60, 6, "SKU-PB-041", "10041", "ForgePower", "Power Banks", "powerbank,charger,battery,usb", 0.45, "15x7x3 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 15.0, 4.8, 185, "Color: Metallic Gray", "Output: 65W PD Type-C"),
            new Product("Smart LED Desk Lamp", "Touch-controlled eye-care LED lamp with wireless charging pad.", 2199.0, "https://images.unsplash.com/photo-1534349735944-2b3a6f7a268f?w=500", "https://images.unsplash.com/photo-1534349735944-2b3a6f7a268f?w=100", elec, seller, 45, 5, "SKU-LP-042", "10042", "ForgeHome", "Desk Lamps", "lamp,light,desk,smart", 1.1, "40x15x15 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 10.0, 4.6, 92, "Color: Minimal White, Black", "Features: 5 Color Modes, 10W Wireless Charger"),
            new Product("11-in-1 USB-C Docking Station", "Dual 4K HDMI + 100W PD + Gigabit Ethernet hub.", 4499.0, "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500", "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100", elec, seller, 35, 4, "SKU-HB-043", "10043", "ForgeTech", "Hubs", "usb,hub,dock,adapter", 0.2, "14x6x2 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 15.0, 4.7, 130, "Color: Space Gray", "Ports: 2x HDMI, 3x USB 3.0, SD Card"),
            new Product("4K Ultra HD Streaming Webcam", "Autofocus 60FPS webcam with dual noise-cancelling mics.", 3999.0, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100", elec, seller, 40, 5, "SKU-WC-044", "10044", "ForgeVision", "Webcams", "webcam,camera,4k,streaming", 0.25, "10x5x5 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 20.0, 4.6, 84, "Color: Black", "Sensor: 4K 60FPS Sony CMOS"),
            new Product("Wireless Mechanical Numpad", "Hot-swappable 21-key mechanical keypad with Bluetooth.", 1999.0, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100", elec, seller, 50, 5, "SKU-NP-045", "10045", "ForgeKey", "Keyboards", "keyboard,numpad,mechanical,wireless", 0.3, "14x9x4 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 10.0, 4.5, 62, "Color: White/Gray, Black", "Switches: Gateron Yellow"),
            new Product("Oversized Leather Gaming Mousepad", "900x400mm waterproof desk mat with stitched edges.", 1299.0, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100", elec, seller, 80, 10, "SKU-MP-046", "10046", "ForgeMouse", "Mousepads", "mousepad,deskmat,gaming,accessory", 0.6, "40x8x8 cm", 18.0, "6 Months Warranty", "7 Days Return", 0.0, 2, 15.0, 4.7, 205, "Color: Midnight Black, Walnut Brown", "Dimensions: 900x400x3mm"),
            new Product("Aviator Polarized Sunglasses", "UV400 protection titanium frame classic aviators.", 1799.0, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100", app, seller, 50, 5, "SKU-SG-047", "10047", "ForgeVision", "Sunglasses", "sunglasses,shades,aviator,fashion", 0.1, "16x7x5 cm", 5.0, "6 Months Warranty", "7 Days Return", 0.0, 2, 20.0, 4.6, 118, "Color: Gold/Green, Black/Smoke", "Lenses: TAC Polarized"),
            new Product("Minimalist Slim Bifold Leather Wallet", "RFID blocking genuine Nappa leather pocket wallet.", 1499.0, "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500", "https://images.unsplash.com/photo-1627123424574-724758594e93?w=100", app, seller, 70, 8, "SKU-WL-048", "10048", "LeatherForge", "Wallets", "wallet,leather,rfid,slim", 0.1, "11x8x1 cm", 5.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 10.0, 4.8, 160, "Color: Cognac Brown, Stealth Black", "Material: Nappa Leather"),
            new Product("Thermal Stainless Steel Flask 1000ml", "24-hour cold / 12-hour hot double-wall insulated bottle.", 1299.0, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=100", app, seller, 60, 6, "SKU-BT-049", "10049", "ForgeLife", "Bottles", "bottle,flask,water,steel", 0.5, "30x8x8 cm", 5.0, "1 Year Warranty", "7 Days Return", 0.0, 2, 15.0, 4.7, 195, "Color: Matte Black, Steel", "Capacity: 1000ml"),
            new Product("Ergonomic Lumbar Cushion", "Memory foam orthopedic posture support back cushion.", 1899.0, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500", "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=100", app, seller, 40, 5, "SKU-CS-050", "10050", "ForgeComfort", "Cushions", "cushion,pillow,lumbar,ergonomic", 0.7, "40x35x10 cm", 5.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 10.0, 4.6, 88, "Color: Charcoal Gray", "Filling: Memory Foam"),
            new Product("Noise Cancelling Studio USB Mic", "Cardioid condenser microphone with boom arm for streaming.", 4499.0, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100", elec, seller, 30, 4, "SKU-MC-051", "10051", "ForgeAudio", "Microphones", "microphone,mic,audio,streaming", 1.2, "40x20x10 cm", 18.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 15.0, 4.8, 112, "Color: Matte Black", "Sample Rate: 24-bit 192kHz"),
            new Product("Heavy Duty Travel Duffel Bag", "50L water-resistant sports gym & travel duffel bag.", 2799.0, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100", app, seller, 35, 5, "SKU-DF-052", "10052", "TravelForge", "Duffel Bags", "bag,duffel,travel,gym", 1.1, "55x30x28 cm", 5.0, "1 Year Warranty", "7 Days Return", 0.0, 3, 20.0, 4.7, 140, "Color: Army Olive, Black", "Capacity: 50L")
        };

        for (Product p : prods) {
            productRepository.save(p);
        }
    }

}
