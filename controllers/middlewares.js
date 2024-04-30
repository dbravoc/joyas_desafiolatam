const generarInforme = (req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] Acceso a la ruta: ${req.path}`);
    next();
};

module.exports = { generarInforme };
