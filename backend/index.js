import { config } from "dotenv";
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import userRoute from "./route/user.route.js";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import paymentRoute from "./route/payment.route.js";
import reminder from "./route/addReminder.route.js";
import dashboardStatsRoute from "./route/adminDashboard.route.js";
import { reminderNotificationCron } from "./automation/reminderNotificationCron.js";
import { planNotificationCron } from "./automation/planNotificationCron.js";
import { checkSubscriptions } from "./automation/checkSubscriptionCron.js";
import remarkRoute from "./route/remark.route.js";
import planRoute from "./route/plan.route.js";
import appreciationRoute from "./route/appreciation.route.js";
import emailTemplateRoute from "./route/emailTemplate.route.js";
import coinRuleRoute from "./route/coinRule.route.js";
import cookieParser from "cookie-parser";
import { checkRemarkDelaysCron } from "./automation/checkRemarkDelaysCron.js";

const app = express();
config();

const PORT = process.env.PORT || 3001;
const URI = process.env.MONGODB_URI;

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(URI);
  console.log("database connected");
}

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: URI,
      ttl: 14 * 24 * 60 * 60, 
    }),
    cookie: {
      secure: true, 
      httpOnly: true,
      sameSite: "None", 
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/user", userRoute);
app.use("/plan", paymentRoute);
app.use("/task", reminder);
app.use("/admin", dashboardStatsRoute);
app.use("/remark", remarkRoute);
app.use("/plan", planRoute);
app.use("/api/user", appreciationRoute);
app.use("/email", emailTemplateRoute);
app.use("/coins", coinRuleRoute);

reminderNotificationCron();
planNotificationCron();
checkSubscriptions();
checkRemarkDelaysCron();

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
