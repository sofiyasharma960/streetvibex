export const adminAuth = (req, res, next) => {
  const apiKey = req.headers["x-admin-key"];
  
  if (!apiKey || apiKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
};