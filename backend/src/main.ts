import "reflect-metadata";
import { env } from "./config/env.js";
import app from "./core/app.js";
import { connectDB } from "./config/db.js";
import type { Application } from "express";
import registerUserModule from "./modules/user/user.module.js";
import registerCategoryModule from "./modules/category/category.module.js";
import registerProductModule from "./modules/product/product.module.js";
import registerSettingsModule from "./modules/settings/settings.module.js";
import registerCartModule from "./modules/cart/cart.module.js";
import registerOrderModule from "./modules/order/order.module.js";
import { startCronJobs } from "./core/scheduler/cron.manager.js";
import registerAnalysisModule from "./modules/analysis/analysis.module.js";
import registerReportModule from "./modules/reports/report.module.js";
import registerHeroModule from "./modules/hero/hero.module.js";
import registerBannerModule from "./modules/banner/banner.module.js";
import registerTestimonialModule from "./modules/testimonial/testimonial.module.js";
import registerWishlistModule from "./modules/wishlist/wishlist.module.js";
import registerAboutModule from "./modules/about/about.module.js";
import registerBlogModule from "./modules/blog/blog.module.js";
import registerFaqModule from "./modules/faq/faq.module.js";

const PORT = env.PORT;

const startServer = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    // console.log("Database connected successfully.");
    startCronJobs();

    const expressApp: Application = app;

    registerUserModule(expressApp);
    registerCategoryModule(expressApp);
    registerProductModule(expressApp);
    registerSettingsModule(expressApp);
    registerCartModule(expressApp);
    registerOrderModule(expressApp);
    registerAnalysisModule(expressApp);
    registerReportModule(expressApp);
    registerHeroModule(expressApp);
    registerBannerModule(expressApp);
    registerTestimonialModule(expressApp);
    registerWishlistModule(expressApp);
    registerAboutModule(expressApp);
    registerBlogModule(expressApp);
    registerFaqModule(expressApp);

    expressApp.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error("An unknown error occurred", error);
    }
    process.exit(1);
  }
};

startServer();
