const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            const result = await Promise.resolve(requestHandler(req, res, next));
            return result;
        } catch (error) {
            next(error);
        }
    }
}

export {asyncHandler}