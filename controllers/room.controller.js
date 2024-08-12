const { PrismaClient } = require("@prisma/client");
const { checkRooms } = require("../libs/checkrooms.libs");
const prisma = new PrismaClient();

exports.getRooms = async (req, res, next) => {
  try {
    await checkRooms(req);

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
    await checkRooms(req);

    let user = await prisma.user.findUnique({
      where: {
        id: req.user_data.id,
      },
      include: {
        room: true,
      },
    });

    delete user.password;

    return res.status(200).json({
      status: true,
      message: "Berhasil mendapatkan data kamar",
      data: {
        user_room: user,
      },
    });
  } catch (error) {
    next(error);
  }
};
