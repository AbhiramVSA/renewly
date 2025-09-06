import User from '../models/user.model.js';

/**
 * Clean up expired refresh tokens from all users
 * This should be run periodically (e.g., daily via cron job)
 */
export const cleanupExpiredTokens = async () => {
    try {
        const result = await User.updateMany(
            {},
            {
                $pull: {
                    refreshTokens: {
                        expiresAt: { $lte: new Date() }
                    }
                }
            }
        );
        
        console.log(`Cleaned up expired refresh tokens for ${result.modifiedCount} users`);
        return result;
    } catch (error) {
        console.error('Error cleaning up expired tokens:', error);
        throw error;
    }
};

/**
 * Clean up expired tokens for a specific user
 */
export const cleanupUserExpiredTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;
        
        const initialCount = user.refreshTokens.length;
        user.refreshTokens = user.refreshTokens.filter(token => token.expiresAt > new Date());
        
        if (user.refreshTokens.length !== initialCount) {
            await user.save();
            console.log(`Cleaned up ${initialCount - user.refreshTokens.length} expired tokens for user ${userId}`);
        }
        
        return user;
    } catch (error) {
        console.error(`Error cleaning up expired tokens for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Get token statistics (useful for monitoring)
 */
export const getTokenStats = async () => {
    try {
        const pipeline = [
            {
                $project: {
                    totalTokens: { $size: '$refreshTokens' },
                    activeTokens: {
                        $size: {
                            $filter: {
                                input: '$refreshTokens',
                                cond: { $gt: ['$$this.expiresAt', new Date()] }
                            }
                        }
                    },
                    expiredTokens: {
                        $size: {
                            $filter: {
                                input: '$refreshTokens',
                                cond: { $lte: ['$$this.expiresAt', new Date()] }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    totalTokens: { $sum: '$totalTokens' },
                    totalActiveTokens: { $sum: '$activeTokens' },
                    totalExpiredTokens: { $sum: '$expiredTokens' }
                }
            }
        ];
        
        const result = await User.aggregate(pipeline);
        return result[0] || {
            totalUsers: 0,
            totalTokens: 0,
            totalActiveTokens: 0,
            totalExpiredTokens: 0
        };
    } catch (error) {
        console.error('Error getting token stats:', error);
        throw error;
    }
};
