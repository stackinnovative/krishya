import { Router } from "express";
import { container } from "../../../di/container.js";
import { AdminController } from "../controllers/admin.auth.controller.js";
import { AdminUserController } from "../controllers/admin.user.controller.js";
import { adminLoginLimiter } from "../../../config/rate.limit.js";
import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";

const router = Router()

const adminController = container.resolve(AdminController);
const adminUserController = container.resolve(AdminUserController);
const authenticate = container.resolve(Authenticate);

router.post('/login',
    adminLoginLimiter,
    (req,res)=> adminController.loginAdminController(req, res)
)

//list users (customers + admin/staff) - filter with ?role=user or ?role=admin
router.get('/users',
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => adminUserController.getAdminUsers(req, res))

//single user detail
router.get('/users/:userId',
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => adminUserController.getAdminUserDetail(req, res))

//create a new user (customer or admin/staff)
router.post('/users',
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => adminUserController.createAdminUser(req, res))

//edit a user's profile / role / password
router.put('/users/:userId',
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => adminUserController.updateAdminUser(req, res))

//deactivate a user
router.patch('/users/:userId/block',
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => adminUserController.blockAdminUser(req, res))

//reactivate a user
router.patch('/users/:userId/unblock',
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => adminUserController.unblockAdminUser(req, res))

export default router