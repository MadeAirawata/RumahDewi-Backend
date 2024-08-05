const { PrismaClient, PAYMENT_STATUS } = require("@prisma/client");
const { addDays } = require("../libs/date-fns");
const { uploader } = require("../libs/cloudinary.libs");
const prisma = new PrismaClient();
const crypto = require("crypto");
const path = require("path");

exports.rentRoom = async (req, res, next) => {
  try {
    const { total_month, room_id } = req.body;

    const room = await prisma.room.findUnique({
      where: {
        id: room_id,
      },
    });

    const userRoom = await prisma.userRoom.findUnique({
      where: {
        user_id: req.user_data.id,
      },
    });

    // Cek apakah user telah menyewa kamar
    if (userRoom.room_id) {
      return res.status(400).json({
        status: false,
        message: "Anda telah mempunyai kamar yang disewa",
        data: null,
      });
    }

    // Cek apakah kamar tersebut ada
    if (!room) {
      return res.status(404).json({
        status: false,
        message: "Data kamar tidak ditemukan",
        data: null,
      });
    }

    // Cek apakah kamar tersedia
    if (room.status == "DIPESAN" || room.status == "TERISI") {
      return res.status(400).json({
        status: false,
        message: "Kamar tidak tersedia",
        data: null,
      });
    }

    const [payment, roomData, userRoomData] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          user_id: req.user_data.id,
          room_id,
          total_month: Number(total_month),
          total_payment: total_month * room.monthly_price,
        },
      }),
      prisma.room.update({
        where: {
          id: room_id,
        },
        data: {
          status: "DIPESAN",
        },
      }),
      prisma.userRoom.update({
        where: {
          user_id: req.user_data.id,
        },
        data: {
          room_id: room_id,
        },
      }),
    ]);

    return res.status(201).json({
      status: true,
      message: "Berhasil memesan kamar",
      data: {
        payment,
        room: roomData,
        user_room: userRoomData,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.addPayment = async (req, res, next) => {
  try {
    const { total_month } = req.body;

    const userRoom = await prisma.userRoom.findUnique({
      where: {
        user_id: req.user_data.id,
      },
      include: {
        room: true,
      },
    });

    const pendingPayment = await prisma.payment.findFirst({
      where: {
        user_id: req.user_data.id,
        status: "MENUNGGU",
      },
    });

    // Cek apakah user telah menyewa kamar
    if (!userRoom.room_id) {
      return res.status(400).json({
        status: false,
        message: "Anda belum mempunyai kamar yang disewa",
        data: null,
      });
    }

    if (userRoom.due_date && userRoom.due_date < new Date()) {
      await prisma.$transaction([
        await prisma.room.update({
          where: {
            id: userRoom.room_id,
          },
          data: {
            status: "TERSEDIA",
          },
        }),
        await prisma.userRoom.update({
          where: {
            user_id: req.user_data.id,
          },
          data: {
            room_id: null,
            due_date: null,
          },
        }),
      ]);

      return res.status(400).json({
        status: false,
        message: "Masa berlaku sewa kamar anda telah habis. Mohon sewa ulang kamar",
        data: null,
      });
    }

    if (pendingPayment) {
      return res.status(400).json({
        status: false,
        message: "Gagal menambah pembayaran. Masih ada pembayaran yang menunggu untuk diperiksa",
        data: null,
      });
    }

    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          user_id: req.user_data.id,
          room_id: userRoom.room_id,
          total_month: Number(total_month),
          total_payment: total_month * userRoom.room.monthly_price,
        },
      }),
    ]);

    return res.status(201).json({
      status: true,
      message: "Berhasil membuat data pembayaran",
      data: {
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    // Extract pagination parameters from query string
    const { page = 1 } = req.query;
    const limit = 10;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        take: limit,
        skip: skip,
        include: {
          user: {
            include: {
              my_room: {
                include: {
                  room: true,
                },
              },
            },
          },
          room: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.payment.count({}),
    ]);

    // Calculate total pages based on the pagination limit
    const totalPage = Math.ceil(total / limit);

    // Return the orders data with pagination information
    return res.status(200).json({
      status: true,
      message: "Berhasil mendapatkan data pembayaran",
      data: {
        payments,
        page: +page,
        total_pages: totalPage,
        total_items: total,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.getMyPayments = async (req, res, next) => {
  try {
    // Extract pagination parameters from query string
    const { page = 1 } = req.query;
    const limit = 10;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        take: limit,
        skip: skip,
        where: {
          user_id: req.user_data.id,
        },
        include: {
          user: true,
          room: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.payment.count({
        where: {
          user_id: req.user_data.id,
        },
      }),
    ]);

    // Calculate total pages based on the pagination limit
    const totalPage = Math.ceil(total / limit);

    // Return the orders data with pagination information
    return res.status(200).json({
      status: true,
      message: "Berhasil mendapatkan data pembayaran",
      data: {
        payments,
        page: +page,
        total_pages: totalPage,
        total_items: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const image = req?.files?.image;

    const payment = await prisma.payment.findUnique({
      where: {
        id: id,
        user_id: req.user_data.id,
      },
    });

    if (!payment) {
      return res.status(404).json({
        status: false,
        message: "Data pembayaran tidak ditemukan",
        data: null,
      });
    }

    if (payment.payment_image) {
      return res.status(400).json({
        status: false,
        message: "Bukti pembayaran telah diupload sebelumnya",
        data: null,
      });
    }

    if (payment.status == "DITOLAK") {
      return res.status(400).json({
        status: false,
        message: "Pembayaran telah ditolak oleh admin",
        data: null,
      });
    }

    if (!image) {
      return res.status(400).json({
        status: false,
        message: "Bukti pembayaran harus disertakan",
        data: null,
      });
    }

    image.publicId = crypto.randomBytes(16).toString("hex");
    image.name = `${image.publicId}${path.parse(image.name).ext}`;

    const imageUpload = await uploader(image);

    const paymentData = await prisma.payment.update({
      where: {
        id: id,
        user_id: req.user_data.id,
      },
      data: {
        payment_image: imageUpload.secure_url,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Bukti pembayaran berhasil diupload",
      data: {
        payment: paymentData,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.changeStatusPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await prisma.payment.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          include: {
            my_room: true,
          },
        },
        room: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        status: false,
        message: "Data pembayaran tidak ditemukan",
        data: null,
      });
    }

    if (!PAYMENT_STATUS[status]) {
      return res.status(400).json({
        status: false,
        message: "Status pembayaran tidak valid",
        data: null,
      });
    }

    if (payment.status !== "MENUNGGU") {
      return res.status(404).json({
        status: false,
        message: "Status pembayaran tidak dapat diubah",
        data: null,
      });
    }

    if (!payment.payment_image && status == PAYMENT_STATUS.DIKONFIRMASI) {
      return res.status(400).json({
        status: false,
        message: "Bukti pembayaran belum diupload",
        data: null,
      });
    }

    if (status == PAYMENT_STATUS.DITOLAK && payment.room.status == "DIPESAN") {
      const [payment_data, user_room, room] = await prisma.$transaction([
        prisma.payment.update({
          where: {
            id: id,
          },
          data: {
            status: status,
          },
        }),
        prisma.userRoom.update({
          where: {
            user_id: payment.user_id,
          },
          data: {
            room_id: null,
            due_date: null,
          },
        }),
        prisma.room.update({
          where: {
            id: payment.room_id,
          },
          data: {
            status: "TERSEDIA",
          },
        }),
      ]);

      return res.status(200).json({
        status: true,
        message: "Status pembayaran berhasil diubah",
        data: {
          payment: payment_data,
          user_room,
          room,
        },
      });
    }

    if (status == PAYMENT_STATUS.DIKONFIRMASI) {
      const [payment_data, user_room, room] = await prisma.$transaction([
        prisma.payment.update({
          where: {
            id: id,
          },
          data: {
            status: status,
          },
        }),
        prisma.userRoom.update({
          where: {
            user_id: payment.user_id,
          },
          data: {
            due_date: addDays(payment?.user?.my_room?.due_date, payment.total_month * 30),
          },
        }),
        prisma.room.update({
          where: {
            id: payment.room_id,
          },
          data: {
            status: "TERISI",
          },
        }),
      ]);

      return res.status(200).json({
        status: true,
        message: "Status pembayaran berhasil diubah",
        data: {
          payment: payment_data,
          user_room,
          room,
        },
      });
    }

    const payment_data = await prisma.payment.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Status pembayaran berhasil diubah",
      data: {
        payment: payment_data,
        user_room: payment.user.my_room,
        room: payment.room,
      },
    });
  } catch (error) {
    next(error);
  }
};
