import { Router } from 'express';
import { signUp }  from "../controllers/auth.controller.js";
import { signIn }  from "../controllers/auth.controller.js";
import { signOut }  from "../controllers/auth.controller.js";

const authRouter = Router();

// Path: api/v1/auth/sign-up (POST)
authRouter.post('/sign-up', signUp);

// Path: api/v1/auth/sign-in
authRouter.post('/sign-in', signIn);

// Path: api/v1/auth/sign-out
authRouter.post('/sign-out', signOut);


export default authRouter;