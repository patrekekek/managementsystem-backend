const requireAdmin = async (req, res, next) => {
    console.log('hoy', req.user.role);

    if (!req.user) {
        return res.status(200).json({ error: "Not Authenticated"})
    }

    if (req.user.role !== "admin" ) {
        return res.status(401).json({ error: "Admin access only"})
    }
    next();
}

module.exports = requireAdmin;