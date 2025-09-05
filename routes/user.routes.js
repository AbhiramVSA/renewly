import { Router } from 'express';
import { getUsers, getUser, changeUserRole } from "../controllers/user.controller.js";
import authorize from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/requireRoles.middleware.js";
import { ROLES } from "../constants/roles.js";

const userRouter = Router();



userRouter.get('/users', authorize, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), getUsers);
userRouter.get('/:id', authorize, getUser);
userRouter.patch('/:userId/role', authorize, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), changeUserRole);
userRouter.post('/', (req, res) => res.send({title: 'CREATE new user'}));
userRouter.put('/', (req, res) => res.send({title: 'UPDATE user'}));
userRouter.delete('/', (req, res) => res.send({title: 'DELETE user'}));

export default userRouter;