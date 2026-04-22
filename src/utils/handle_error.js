function handle_error(error, res) {
  console.error(error.message);

  return res.status(500).json({
    success: false,
    message: error.message || "Erro nao identificado"
  });
}

module.exports = handle_error;