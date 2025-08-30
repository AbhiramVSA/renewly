import { Router } from 'express';
import { getUsers } from "../controllers/user.controller.js";
import { getUser } from "../controllers/user.controller.js";
import authorize from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.get('/users', getUsers);
userRouter.get('/:id', authorize, getUser);
userRouter.post('/', (req, res) => res.send({title: 'CREATE new user'}));
userRouter.put('/', (req, res) => res.send({title: 'UPDATE user'}));
userRouter.delete('/', (req, res) => res.send({title: 'DELETE user'}));

export default userRouter;