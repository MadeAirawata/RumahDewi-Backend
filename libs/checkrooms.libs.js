const { PrismaClient, USER_STATUS, ROOM_STATUS } = require("@prisma/client");
const prisma = new PrismaClient();

exports.checkRooms = async (req) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        user: true,
      },
    });

    for await (let room of rooms) {
      if (room.status === ROOM_STATUS.TERSEDIA) {
        continue;
      }

      if (room.status === ROOM_STATUS.DIPESAN) {
        const payment = await prisma.payment.findFirst({
          where: {
            status: "MENUNGGU",
          },
        });

        if (payment.payment_image) {
          continue;
        }

        const paymentDate = new Date(payment.createdAt);
        paymentDate.setDate(paymentDate.getDate() + 1);

        if (paymentDate < new Date()) {
          const [paymentRes, roomRes] = await Promise.all([
            prisma.payment.update({
              where: {
                id: payment.id,
              },
              data: {
                status: "DITOLAK",
              },
            }),
            prisma.room.update({
              where: {
                id: room.id,
              },
              data: {
                status: "TERSEDIA",
                user_id: null,
              },
            }),
          ]);

          continue;
        }

        continue;
      }

      const due_date = new Date(room.user.due_date);
      const extendDays = room.user.status === USER_STATUS.BARU ? 1 : 2;
      due_date.setDate(due_date.getDate() + extendDays);
      if (due_date < new Date()) {
        const [roomRes] = await Promise.all([
          prisma.room.update({
            where: {
              id: room.id,
            },
            data: {
              status: "TERSEDIA",
              user_id: null,
            },
          }),
        ]);
        continue;
      }
      continue;
    }
  } catch (e) {
    console.log("error", e);
    return e;
  }
};
