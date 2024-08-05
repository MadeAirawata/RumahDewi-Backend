const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getRooms = async (req, res, next) => {
  try {
    let rooms = await prisma.room.findMany({
      orderBy: {
        no_room: "asc",
      },
    });

    return res.status(200).json({
      status: true,
      message: "Berhasil mendapatkan data kamar",
      data: {
        rooms,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserRoom = async (req, res, next) => {
  try {
    let room = await prisma.userRoom.findUnique({
      where: {
        user_id: req.user_data.id,
      },
      include: {
        user: true,
        room: true,
      },
    });

    if (room.due_date && room.due_date < new Date()) {
      await prisma.$transaction([
        await prisma.room.update({
          where: {
            id: room.id,
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
    }

    return res.status(200).json({
      status: true,
      message: "Berhasil mendapatkan data kamar",
      data: {
        user_room: room,
      },
    });
  } catch (error) {
    next(error);
  }
};
