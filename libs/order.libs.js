const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getTotalPayment = async (req) => {
  const { phone, username, password, from_rank_id, to_rank_id, server, processing_time, payment_method } = req.body;

  const [ranks, from_rank, to_rank] = await Promise.all([
    prisma.rank.findMany({
      orderBy: {
        rank_order: "asc",
      },
    }),
    prisma.rank.findUnique({
      where: {
        id: from_rank_id,
      },
    }),
    prisma.rank.findUnique({
      where: {
        id: to_rank_id,
      },
    }),
  ]);

  if (!from_rank) {
    throw {
      statusCode: 404,
      message: "Data rank awal tidak ditemukan",
    };
  }
  if (!to_rank) {
    throw {
      statusCode: 404,
      message: "Data rank tujuan tidak ditemukan",
    };
  }

  if (from_rank.rank_order >= to_rank.rank_order) {
    throw {
      statusCode: 400,
      message: "Data rank awal tidak boleh sama atau kurang dari rank tujuan",
    };
  }

  const SERVER = {
    ASIA: 0,
  };

  const PROCESS = {
    NORMAL: 0,
    CEPAT: 30000,
    KILAT: 60000,
  };

  if (SERVER[server] === undefined) {
    throw {
      statusCode: 404,
      message: "Server tidak valid",
    };
  }
  if (PROCESS[processing_time] === undefined) {
    throw {
      statusCode: 404,
      message: "Waktu proses tidak valid",
    };
  }

  let total_payment = 0;
  for (let i = from_rank.rank_order; i < to_rank.rank_order; i++) {
    total_payment += ranks[i].price;
  }

  total_payment += SERVER[server] + PROCESS[processing_time];

  return total_payment;
};
