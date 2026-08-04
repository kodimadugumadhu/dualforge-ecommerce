package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.model.Category;
import com.enterprise.ecommerce.model.Coupon;
import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.repository.CategoryRepository;
import com.enterprise.ecommerce.repository.CouponRepository;
import com.enterprise.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CouponRepository couponRepository;

    @PostMapping("/query")
    public ResponseEntity<?> handleQuery(@RequestBody Map<String, String> request) {
        String userQuery = request.getOrDefault("query", "").toLowerCase().trim();
        String responseMessage;

        // Check for natural language AI recommendation / decision query (e.g. "I have ₹5000. I need headphones", "Suggest shoes below ₹4000")
        boolean isRecommendationQuery = userQuery.contains("need") || userQuery.contains("suggest") || userQuery.contains("recommend") ||
                                       userQuery.contains("budget") || userQuery.contains("looking for") || userQuery.contains("have ₹") ||
                                       userQuery.contains("rs") || userQuery.contains("below") || userQuery.contains("under") ||
                                       userQuery.contains("best");

        Double extractedBudget = parseBudget(userQuery);
        String categoryOrKeyword = parseKeywords(userQuery);

        if (isRecommendationQuery && (extractedBudget != null || !categoryOrKeyword.isEmpty())) {
            responseMessage = buildAiRecommendationResponse(extractedBudget, categoryOrKeyword, userQuery);
        } else if (userQuery.contains("order") || userQuery.contains("track")) {
            responseMessage = "To track your order, go to the 'My Orders' tab in the navbar. You will see a live progress tracker showing whether your order is Pending, Shipped, or Delivered!";
        } else if (userQuery.contains("refund") || userQuery.contains("cancel") || userQuery.contains("return")) {
            responseMessage = "We offer a 30-day refund policy. If you need to cancel a pending order, please contact our support at support@dualforge.com with your Order ID.";
        } else if (userQuery.contains("payment") || userQuery.contains("phonepe") || userQuery.contains("paytm") || userQuery.contains("gpay")) {
            responseMessage = "We support credit/debit cards and all major UPI apps (PhonePe, Google Pay, Paytm, BHIM). You can select your preferred payment mode during the checkout step.";
        } else if (userQuery.contains("coupon") || userQuery.contains("discount") || userQuery.contains("promo")) {
            List<Coupon> coupons = couponRepository.findAll();
            if (coupons.isEmpty()) {
                responseMessage = "Currently, we don't have any active coupons. Check back later!";
            } else {
                String couponList = coupons.stream()
                        .map(c -> c.getCode() + " (" + c.getDiscountPercent() + "% off)")
                        .collect(Collectors.joining(", "));
                responseMessage = "Active promotional coupons: " + couponList + ". Enter the code in the Coupon input box during Checkout!";
            }
        } else if (userQuery.contains("seller") || userQuery.contains("sell")) {
            responseMessage = "To start selling on DualForge, register a new account with the role set to 'Seller'. You can then list products and track inventory in your Seller Dashboard!";
        } else if (userQuery.contains("contact") || userQuery.contains("support") || userQuery.contains("help")) {
            responseMessage = "You can contact our 24/7 helpdesk at support@dualforge.com or call us at 1800-FORGE-HELP.";
        } else if (userQuery.contains("founder") || userQuery.contains("creator") || userQuery.contains("developer") || userQuery.contains("made") || userQuery.contains("built") || userQuery.contains("team") || userQuery.contains("madhu teja")) {
            responseMessage = "DualForge was designed and coded for excellence by M. Madhu Teja!";
        } else if (userQuery.contains("hello") || userQuery.contains("hi") || userQuery.contains("hey")) {
            responseMessage = "Hello! I am your DualForge AI Assistant. How can I help you today? You can ask about our products, size charts, category list, active coupons, or ask for recommendations like 'I have ₹5000. I need headphones for gaming and travelling'!";
        } else if (userQuery.contains("size") || userQuery.contains("chart") || userQuery.contains("guide") || userQuery.contains("measure")) {
            responseMessage = "Here are our size guides:\n" +
                    "- **Footwear (Shoes)**: Sizes US 7 to 11 (24.4cm to 27.6cm).\n" +
                    "- **Apparel (Clothing)**: Sizes S (Chest 34-36\") to XXL (Chest 50-52\").\n" +
                    "- **Forgebook Laptops**: Screens ranging from 13\" (compact) to 16\" (Pro workstation).\n" +
                    "Select 'View Size Chart' or try our Smart Size Calculator on any product page!";
        } else if (userQuery.contains("product") || userQuery.contains("item") || userQuery.contains("catalog") || userQuery.contains("buy") || userQuery.contains("shop")) {
            List<Product> products = productRepository.findAll();
            if (products.isEmpty()) {
                responseMessage = "Our catalog is currently empty. Please check back later!";
            } else {
                String productList = products.stream()
                        .map(p -> p.getName() + " (₹" + p.getPrice().intValue() + ")")
                        .limit(5)
                        .collect(Collectors.joining(", "));
                responseMessage = "Here are some of our premium products: " + productList + ". Go to the 'Shop' tab to browse the full catalog!";
            }
        } else if (userQuery.contains("category") || userQuery.contains("categories") || userQuery.contains("department")) {
            List<Category> categories = categoryRepository.findAll();
            if (categories.isEmpty()) {
                responseMessage = "We do not have any departments set up yet.";
            } else {
                String categoryList = categories.stream()
                        .map(Category::getName)
                        .collect(Collectors.joining(", "));
                responseMessage = "Our active categories include: " + categoryList + ". You can filter products by category in the Shop tab!";
            }
        } else {
            // General conversation smart fallback
            responseMessage = getConversationalFallback(userQuery);
        }

        Map<String, String> response = new HashMap<>();
        response.put("response", responseMessage);
        return ResponseEntity.ok(response);
    }

    private Double parseBudget(String query) {
        // Regex to extract numbers following ₹, rs, rupees, below, under or raw numbers > 100
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(?:₹|rs\\.?|rupees|below|under|budget|for|have|of)?\\s*(\\d{3,6})", java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher matcher = pattern.matcher(query);
        Double foundBudget = null;
        while (matcher.find()) {
            try {
                double val = Double.parseDouble(matcher.group(1));
                if (val >= 300) { // realistic price threshold
                    foundBudget = val;
                }
            } catch (Exception ignored) {}
        }
        return foundBudget;
    }

    private String parseKeywords(String query) {
        String q = query.toLowerCase();
        if (q.contains("hoodie") || q.contains("jacket") || q.contains("sweatshirt") || q.contains("sweater") ||
            q.contains("fleece") || q.contains("shirt") || q.contains("tshirt") || q.contains("apparel") ||
            q.contains("clothing") || q.contains("fashion") || q.contains("wear") || q.contains("jeans") || q.contains("pant")) {
            return "hoodie";
        }
        if (q.contains("headphone") || q.contains("earphone") || q.contains("anc") || q.contains("audio") ||
            q.contains("bud") || q.contains("headset") || q.contains("earbud") || q.contains("speaker")) {
            return "headphone";
        }
        if (q.contains("shoe") || q.contains("sneaker") || q.contains("footwear") || q.contains("runner") ||
            q.contains("boot") || q.contains("sandal") || q.contains("slipper")) {
            return "shoe";
        }
        if (q.contains("laptop") || q.contains("computer") || q.contains("forgebook") || q.contains("pc") || q.contains("notebook")) {
            return "laptop";
        }
        if (q.contains("watch") || q.contains("smartwatch") || q.contains("band")) {
            return "watch";
        }
        return "";
    }

    private String buildAiRecommendationResponse(Double budget, String keyword, String rawQuery) {
        List<Product> allProducts = productRepository.findAll();
        List<Product> matched = allProducts.stream().filter(p -> {
            boolean matchesKeyword = keyword.isEmpty() ||
                    p.getName().toLowerCase().contains(keyword) ||
                    (p.getCategory() != null && p.getCategory().getName().toLowerCase().contains(keyword)) ||
                    (p.getTags() != null && p.getTags().toLowerCase().contains(keyword)) ||
                    (p.getDescription() != null && p.getDescription().toLowerCase().contains(keyword));
            boolean matchesBudget = budget == null || p.getPrice() <= budget;
            return matchesKeyword && matchesBudget;
        }).collect(Collectors.joining() != null ? Collectors.toList() : null);

        if (matched.isEmpty()) {
            // Fallback to closest products within budget or keyword
            matched = allProducts.stream().filter(p -> budget == null || p.getPrice() <= budget * 1.25)
                    .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                    .limit(2)
                    .collect(Collectors.toList());
        } else {
            matched.sort((a, b) -> Double.compare(b.getRating(), a.getRating()));
        }

        if (matched.isEmpty()) {
            return "🤖 **DualForge AI Decision Assistant**\n\nI couldn't find products matching your exact budget of ₹" + (budget != null ? budget.intValue() : 0) + ". Try browsing our Shop section for our latest catalog offerings!";
        }

        Product bestMatch = matched.get(0);
        StringBuilder sb = new StringBuilder();
        sb.append("🤖 **AI Recommended Product**\n\n");
        sb.append("**").append(bestMatch.getName()).append("** — **₹").append(String.format("%,d", bestMatch.getPrice().intValue())).append("**\n\n");
        
        // Bullet points explaining suitability
        if (bestMatch.getRating() != null) {
            sb.append("✓ Rating: ⭐ ").append(bestMatch.getRating()).append(" / 5.0 (").append(bestMatch.getReviewCount()).append(" reviews)\n");
        }
        if (budget != null) {
            sb.append("✓ Within your ₹").append(String.format("%,d", budget.intValue())).append(" budget\n");
        }
        if (bestMatch.getDiscountPercent() > 0) {
            sb.append("✓ Currently discounted (").append(bestMatch.getDiscountPercent().intValue()).append("% OFF)\n");
        }
        if (bestMatch.getWarranty() != null && !bestMatch.getWarranty().isEmpty()) {
            sb.append("✓ Includes ").append(bestMatch.getWarranty()).append("\n");
        }
        if (rawQuery.contains("gaming") || rawQuery.contains("travel")) {
            sb.append("✓ Ideal choice for gaming, travel, and extended daily usage\n");
        } else if (rawQuery.contains("run") || rawQuery.contains("sport")) {
            sb.append("✓ Engineered for high-performance activities & comfort\n");
        } else {
            sb.append("✓ Premium build quality & verified seller authenticity\n");
        }
        
        sb.append("✓ Stock: ").append(bestMatch.getStockQuantity() > 0 ? "🟢 Available (" + bestMatch.getStockQuantity() + " left)" : "🔴 Sold Out").append("\n\n");
        sb.append("💡 *Why this fits:* Perfect balance of customer satisfaction, features, and price value!");

        return sb.toString();
    }

    private String getConversationalFallback(String query) {
        if (query.contains("joke")) {
            return "Why did the computer go to the doctor? Because it had a virus! 😄";
        } else if (query.contains("weather")) {
            return "It's always a beautiful sunny day in the cloud! ☀️ Make sure to check your local forecast for physical weather details.";
        } else if (query.contains("thank") || query.contains("cool") || query.contains("awesome") || query.contains("great")) {
            return "You're very welcome! I'm happy to assist you. Let me know if there's anything else you need help with!";
        } else if (query.contains("who are you") || query.contains("your name")) {
            return "I am the DualForge Assistant bot, built to guide you through the DualForge platform!";
        } else if (query.contains("time")) {
            return "Time flies when you are shopping! Please check your device clock for the current local time.";
        } else if (query.contains("bye") || query.contains("goodbye") || query.contains("exit")) {
            return "Goodbye! Have a great day and happy shopping at DualForge!";
        } else {
            return "I'm a store assistant bot. I can help with product details, active coupons, size charts, order tracking, and general queries. Feel free to ask!";
        }
    }
}


