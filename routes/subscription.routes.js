import { Router } from 'express';
import authorize from '../middleware/auth.middleware.js';
import { createSubscription,
         getUserSubscriptions,
         getAllSubscriptions,
         updateSubscription,
         deleteSubscription,
         cancelSubscription
 }  from '../controllers/subscription.controller.js';
import { requireRoles } from '../middleware/requireRoles.middleware.js';
import { ROLES } from '../constants/roles.js';

const subscriptionRouter = new Router();

subscriptionRouter.get('/', authorize, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), getAllSubscriptions);

subscriptionRouter.get('/:id', (req, res) => res.send({title: 'GET subscription details'}));

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id', authorize, updateSubscription);

subscriptionRouter.delete('/:id', authorize, deleteSubscription);

subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

subscriptionRouter.put('/:id/cancel', authorize, cancelSubscription);

subscriptionRouter.get('/upcoming-renewals', (req, res) => res.send({title: 'GET upcoming renewals'}));

export default subscriptionRouter;
